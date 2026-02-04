import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { logAction } from '../middleware/rbac.js'
import * as traceabilityService from '../services/traceabilityService.js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Generate unique product ID
 * Format: PROD-{timestamp}-{random}
 */
const generateProductId = () => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    return `PROD-${timestamp}-${random}`
}

/**
 * Generate QR code (placeholder - in production use proper QR library)
 */
const generateQRCode = (product_id) => {
    return `QR-${product_id}-${Math.random().toString(36).substring(2, 10)}`
}

/**
 * POST /api/products/create
 * Create jewellery product from tokens
 * Authorization: Requires 'create_product' permission
 */
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            type,
            gross_weight,
            net_gold_weight,
            purity,
            craftsman_id,
            token_composition,
            wastage_log_id
        } = req.body
        const userId = req.user.id

        // Validate required fields
        if (!name || !type || !gross_weight || !net_gold_weight || !token_composition) {
            return res.status(400).json({
                error: 'Missing required fields: name, type, gross_weight, net_gold_weight, token_composition'
            })
        }

        // Validate token_composition is non-empty array
        if (!Array.isArray(token_composition) || token_composition.length === 0) {
            return res.status(400).json({ error: 'token_composition must be a non-empty array' })
        }

        // Validate product type
        const validTypes = ['ring', 'necklace', 'bracelet', 'earrings', 'pendant', 'other']
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Invalid product type',
                valid_types: validTypes
            })
        }

        // Validate weights
        if (gross_weight <= 0 || net_gold_weight <= 0 || net_gold_weight > gross_weight) {
            return res.status(400).json({
                error: 'Invalid weights',
                constraints: '0 < net_gold_weight <= gross_weight'
            })
        }

        // Extract token IDs
        const tokenIds = token_composition.map(tc => tc.token_id)

        // Fetch all tokens
        const { data: tokens, error: tokensError } = await supabase
            .from('tokens')
            .select('id, token_id, weight, purity, status, current_owner_id')
            .in('id', tokenIds)

        if (tokensError || !tokens || tokens.length !== tokenIds.length) {
            return res.status(404).json({ error: 'One or more tokens not found' })
        }

        // Verify user owns all tokens
        const notOwned = tokens.filter(t => t.current_owner_id !== userId)
        if (notOwned.length > 0) {
            return res.status(403).json({
                error: 'You do not own all specified tokens',
                not_owned: notOwned.map(t => t.token_id)
            })
        }

        // Verify all tokens are active
        const inactiveTokens = tokens.filter(t => t.status !== 'active')
        if (inactiveTokens.length > 0) {
            return res.status(400).json({
                error: 'All tokens must be active',
                inactive: inactiveTokens.map(t => t.token_id)
            })
        }

        // Calculate total weight used
        const totalWeightUsed = token_composition.reduce((sum, tc) => {
            return sum + parseFloat(tc.weight_used)
        }, 0)

        // Get wastage if provided
        let wastageWeight = 0
        if (wastage_log_id) {
            const { data: wastage, error: wastageError } = await supabase
                .from('wastage_logs')
                .select('wastage_weight, approval_status')
                .eq('id', wastage_log_id)
                .single()

            if (wastageError || !wastage) {
                return res.status(404).json({ error: 'Wastage log not found' })
            }

            if (['pending_review', 'flagged_for_audit'].includes(wastage.approval_status)) {
                return res.status(400).json({
                    error: 'Wastage requires approval',
                    wastage_status: wastage.approval_status
                })
            }

            wastageWeight = parseFloat(wastage.wastage_weight)
        }

        // Mass balance validation: net_gold_weight = SUM(weight_used) + wastage (±0.01g)
        const totalUsedWithWastage = parseFloat((totalWeightUsed + wastageWeight).toFixed(2))
        const netWeight = parseFloat(net_gold_weight.toFixed(2))
        const discrepancy = Math.abs(netWeight - totalUsedWithWastage)

        if (discrepancy > 0.01) {
            return res.status(400).json({
                error: 'Mass balance violation',
                net_gold_weight: netWeight,
                total_weight_used: totalWeightUsed,
                wastage_weight: wastageWeight,
                total_calculated: totalUsedWithWastage,
                discrepancy: discrepancy.toFixed(3),
                message: `Net gold weight (${netWeight}g) must equal sum (${totalUsedWithWastage}g) ±0.01g`
            })
        }

        // Verify each token has sufficient weight
        for (const tc of token_composition) {
            const token = tokens.find(t => t.id === tc.token_id)
            if (parseFloat(tc.weight_used) > parseFloat(token.weight)) {
                return res.status(400).json({
                    error: 'Insufficient token weight',
                    token_id: token.token_id,
                    available: token.weight,
                    requested: tc.weight_used
                })
            }
        }

        // Generate product ID and QR code
        const productId = generateProductId()
        const qrCode = generateQRCode(productId)

        // Create product
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                product_id: productId,
                name: name,
                type: type,
                gross_weight: gross_weight,
                net_gold_weight: net_gold_weight,
                purity: purity || tokens[0].purity,
                craftsman_id: craftsman_id || userId,
                qr_code: qrCode
            })
            .select()
            .single()

        if (productError) {
            console.error('Product creation error:', productError)
            return res.status(500).json({ error: 'Failed to create product' })
        }

        // Create composition entries
        const compositionEntries = []
        for (const tc of token_composition) {
            const percentage = (parseFloat(tc.weight_used) / net_gold_weight) * 100

            const { data: entry, error: entryError } = await supabase
                .from('product_token_composition')
                .insert({
                    product_id: product.id,
                    token_id: tc.token_id,
                    weight_used: tc.weight_used,
                    percentage: percentage.toFixed(2)
                })
                .select()
                .single()

            if (entryError) {
                console.error('Composition entry error:', entryError)
                // Rollback: delete product
                await supabase.from('products').delete().eq('id', product.id)
                return res.status(500).json({ error: 'Failed to create composition entry' })
            }

            compositionEntries.push(entry)
        }

        // Mark all tokens as converted_to_product
        for (const token of tokens) {
            await supabase
                .from('tokens')
                .update({ status: 'converted_to_product' })
                .eq('id', token.id)
        }

        // Log product creation
        await logAction(
            userId,
            'create_product',
            'product',
            product.id,
            {
                product_id: productId,
                token_count: tokens.length,
                net_gold_weight,
                wastage_weight: wastageWeight
            },
            req.ip
        )

        res.status(201).json({
            ...product,
            composition: compositionEntries,
            tokens_used: tokens.map(t => ({ token_id: t.token_id, status: 'converted_to_product' }))
        })

    } catch (error) {
        console.error('Create product error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * GET /api/products/:id
 * Get product details with composition
 * Authorization: Public (read-only)
 */
export const getProduct = async (req, res) => {
    try {
        const productId = req.params.id

        // Fetch product with composition
        const { data: product, error } = await supabase
            .from('products')
            .select(`
                *,
                craftsman:participants!craftsman_id(name, role),
                composition:product_token_composition(
                    *,
                    token:tokens(token_id, batch_id, weight, purity)
                )
            `)
            .eq('id', productId)
            .single()

        if (error || !product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        res.json(product)

    } catch (error) {
        console.error('Get product error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * GET /api/products/:id/trace
 * Full ancestry traceability (QR code endpoint)
 * Authorization: Public (for customer verification)
 */
export const traceProduct = async (req, res) => {
    try {
        const productId = req.params.id

        // Get product with composition
        const { data: product, error: productError } = await supabase
            .from('products')
            .select(`
                *,
                craftsman:participants!craftsman_id(name),
                composition:product_token_composition(*, token:tokens(*))
            `)
            .eq('id', productId)
            .single()

        if (productError || !product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        // Build complete traceability for each token used
        const compositionWithAncestry = []
        const allMines = new Map()

        for (const comp of product.composition) {
            const tokenId = comp.token.id

            // Get mine origins for this token
            const mineOrigins = await traceabilityService.getMineOrigins(tokenId)

            // Get lineage tree
            const lineageTree = await traceabilityService.buildLineageTree(tokenId)
            const stats = traceabilityService.getLineageStats(lineageTree)

            // Accumulate mine sources
            for (const mine of mineOrigins) {
                const mineKey = mine.name
                if (!allMines.has(mineKey)) {
                    allMines.set(mineKey, {
                        name: mine.name,
                        batch_id: mine.batch_id,
                        contribution_percentage: 0
                    })
                }

                // Weight mine contribution by token's percentage in product
                const weightedContribution = (parseFloat(mine.percentage) * parseFloat(comp.percentage)) / 100
                const existing = allMines.get(mineKey)
                existing.contribution_percentage += weightedContribution
            }

            compositionWithAncestry.push({
                token_id: comp.token.token_id,
                weight_used: comp.weight_used,
                percentage: comp.percentage,
                ancestry: {
                    mines: mineOrigins,
                    lineage_depth: stats.deepest_generation,
                    total_transformations: stats.total_transformations,
                    lineage_tree: lineageTree
                }
            })
        }

        // Convert mine map to array
        const mineSourceSummary = Array.from(allMines.values())
            .map(m => ({
                ...m,
                contribution_percentage: parseFloat(m.contribution_percentage.toFixed(2))
            }))
            .sort((a, b) => b.contribution_percentage - a.contribution_percentage)

        res.json({
            product: {
                product_id: product.product_id,
                name: product.name,
                type: product.type,
                net_gold_weight: product.net_gold_weight,
                purity: product.purity,
                craftsman: product.craftsman.name,
                qr_code: product.qr_code
            },
            composition: compositionWithAncestry,
            mine_sources: mineSourceSummary,
            total_source_mines: mineSourceSummary.length,
            traceability_score: 100 // All tokens fully traced
        })

    } catch (error) {
        console.error('Trace product error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
/**
 * GET /api/products/my
 * Get products owned by the current craftsman
 */
export const getMyProducts = async (req, res) => {
    try {
        const userId = req.user.id
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('craftsman_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(products)
    } catch (error) {
        console.error('Get my products error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * POST /api/products/:id/transfer
 * Transfer product ownership
 */
export const transferProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const { to_participant_id, notes } = req.body
        const userId = req.user.id

        // Verify product ownership
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('id, product_id, craftsman_id')
            .eq('id', productId)
            .single()

        if (fetchError || !product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        if (product.craftsman_id !== userId) {
            return res.status(403).json({ error: 'You do not own this product' })
        }

        // Update ownership
        const { error: updateError } = await supabase
            .from('products')
            .update({ craftsman_id: to_participant_id })
            .eq('id', productId)

        if (updateError) throw updateError

        // Log action
        await logAction(userId, 'transfer_product', 'product', product.id, {
            to_participant_id,
            notes: notes || 'Product transferred'
        }, req.ip)

        res.json({ message: 'Product transferred successfully', product_id: product.product_id })
    } catch (error) {
        console.error('Transfer product error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

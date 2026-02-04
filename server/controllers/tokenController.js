import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { logAction } from '../middleware/rbac.js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Generate unique token ID
 * Format: TOK-{timestamp}-{random}
 */
const generateTokenId = () => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 7).toUpperCase()
    return `TOK-${timestamp}-${random}`
}

/**
 * POST /api/tokens/mint
 * Assisted token minting with human confirmation
 * Authorization: Requires 'mint_token' permission (refiner or admin)
 */
export const mintToken = async (req, res) => {
    try {
        const { batch_id, weight, current_owner_id, confirm_human } = req.body
        const userId = req.user.id

        // Validate required fields
        if (!batch_id || !weight || !current_owner_id) {
            return res.status(400).json({
                error: 'Missing required fields: batch_id, weight, current_owner_id'
            })
        }

        // Require human confirmation flag
        if (confirm_human !== true) {
            return res.status(400).json({
                error: 'Human confirmation required (confirm_human must be true)'
            })
        }

        // Validate weight is positive number
        if (isNaN(weight) || weight <= 0) {
            return res.status(400).json({ error: 'Weight must be a positive number' })
        }

        // Verify batch exists
        const { data: batch, error: batchError } = await supabase
            .from('gold_batches')
            .select('id, weight, purity, source')
            .eq('id', batch_id)
            .single()

        if (batchError || !batch) {
            return res.status(404).json({ error: 'Gold batch not found' })
        }

        // Verify current_owner exists and is active
        const { data: owner, error: ownerError } = await supabase
            .from('participants')
            .select('id, name, active')
            .eq('id', current_owner_id)
            .single()

        if (ownerError || !owner) {
            return res.status(404).json({ error: 'Owner participant not found' })
        }

        if (!owner.active) {
            return res.status(400).json({ error: 'Owner participant is inactive' })
        }

        // Generate unique token ID
        const tokenId = generateTokenId()

        // Create token
        const { data: token, error: tokenError } = await supabase
            .from('tokens')
            .insert({
                token_id: tokenId,
                batch_id: batch_id,
                weight: weight,
                purity: batch.purity,
                status: 'active',
                current_owner_id: current_owner_id,
                minted_by_id: userId
            })
            .select()
            .single()

        if (tokenError) {
            console.error('Token creation error:', tokenError)
            return res.status(500).json({ error: 'Failed to create token', details: tokenError.message })
        }

        // Log minting action to audit trail
        await logAction(
            userId,
            'mint_token',
            'token',
            token.id,
            { batch_id, weight, token_id: tokenId, source: batch.source },
            req.ip
        )

        res.status(201).json({
            ...token,
            batch_source: batch.source
        })

    } catch (error) {
        console.error('Mint token error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * GET /api/tokens
 * List tokens with optional filtering
 * Authorization: Owners see own tokens, auditors see all
 */
export const getTokens = async (req, res) => {
    try {
        const { status, owner_id } = req.query
        const participant = req.participant

        let query = supabase
            .from('tokens')
            .select(`
                *,
                batch:gold_batches(batch_id, source),
                owner:participants!current_owner_id(name, role)
            `)

        // Apply filters
        if (status) {
            query = query.eq('status', status)
        }

        // RBAC: Only admins/auditors can see all tokens
        if (participant.role !== 'admin' && participant.role !== 'auditor') {
            query = query.eq('current_owner_id', req.user.id)
        } else if (owner_id) {
            // Admin/auditor can filter by owner
            query = query.eq('current_owner_id', owner_id)
        }

        query = query.order('created_at', { ascending: false })

        const { data: tokens, error } = await query

        if (error) {
            throw error
        }

        res.json(tokens)

    } catch (error) {
        console.error('Get tokens error:', error)
        res.status(500).json({ error: 'Failed to fetch tokens' })
    }
}

/**
 * POST /api/tokens/:id/split
 * Split token into multiple children
 * Authorization: Requires 'split_token' permission + ownership
 */
export const splitToken = async (req, res) => {
    try {
        const tokenId = req.params.id
        const { child_weights, operation_type = 'split', wastage_log_id } = req.body
        const userId = req.user.id

        // Validate child_weights array
        if (!Array.isArray(child_weights) || child_weights.length === 0) {
            return res.status(400).json({ error: 'child_weights must be a non-empty array' })
        }

        // Validate all weights are positive
        if (child_weights.some(w => isNaN(w) || w <= 0)) {
            return res.status(400).json({ error: 'All child weights must be positive numbers' })
        }

        // Get parent token (already verified ownership by middleware)
        const parentToken = req.token

        if (parentToken.status !== 'active') {
            return res.status(400).json({ error: 'Cannot split non-active token' })
        }

        // Calculate total child weight
        const totalChildWeight = child_weights.reduce((sum, w) => sum + parseFloat(w), 0)

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

            // Check wastage is approved
            if (wastage.approval_status === 'pending_review' || wastage.approval_status === 'flagged_for_audit') {
                return res.status(400).json({
                    error: 'Wastage requires approval before proceeding',
                    wastage_status: wastage.approval_status
                })
            }

            if (wastage.approval_status === 'rejected') {
                return res.status(400).json({ error: 'Wastage was rejected' })
            }

            wastageWeight = parseFloat(wastage.wastage_weight)
        }

        // Mass balance validation (±0.01g tolerance)
        const totalCalculated = parseFloat((totalChildWeight + wastageWeight).toFixed(2))
        const parentWeight = parseFloat(parentToken.weight.toFixed(2))
        const discrepancy = Math.abs(parentWeight - totalCalculated)

        if (discrepancy > 0.01) {
            return res.status(400).json({
                error: 'Mass balance violation',
                parent_weight: parentWeight,
                total_child_weight: totalChildWeight,
                wastage_weight: wastageWeight,
                sum_calculated: totalCalculated,
                discrepancy: discrepancy.toFixed(3),
                message: `Sum (${totalCalculated}g) must equal parent (${parentWeight}g) ±0.01g`
            })
        }

        // Create child tokens
        const childTokens = []
        for (const weight of child_weights) {
            const childTokenId = generateTokenId()

            const { data: childToken, error: childError } = await supabase
                .from('tokens')
                .insert({
                    token_id: childTokenId,
                    batch_id: parentToken.batch_id,
                    weight: weight,
                    purity: parentToken.purity,
                    status: 'active',
                    current_owner_id: parentToken.current_owner_id,
                    minted_by_id: userId,
                    parent_token_id: tokenId
                })
                .select()
                .single()

            if (childError) {
                console.error('Child token creation error:', childError)
                return res.status(500).json({ error: 'Failed to create child token' })
            }

            childTokens.push(childToken)

            // Create lineage entry
            await supabase
                .from('token_lineage')
                .insert({
                    child_token_id: childToken.id,
                    parent_token_id: tokenId,
                    operation_type: 'split',
                    weight_transferred: weight,
                    performed_by_id: userId
                })
        }

        // Mark parent as consumed
        await supabase
            .from('tokens')
            .update({ status: 'consumed' })
            .eq('id', tokenId)

        // Log split action
        await logAction(
            userId,
            'split_token',
            'token',
            tokenId,
            { child_count: child_weights.length, child_weights, wastage_weight: wastageWeight },
            req.ip
        )

        res.status(201).json({
            parent_token_id: tokenId,
            parent_status: 'consumed',
            children: childTokens
        })

    } catch (error) {
        console.error('Split token error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * POST /api/tokens/merge
 * Merge multiple tokens into one
 * Authorization: Requires 'merge_token' permission + ownership of all tokens
 */
export const mergeTokens = async (req, res) => {
    try {
        const { token_ids, operation_type = 'merge', wastage_log_id } = req.body
        const userId = req.user.id

        // Tokens already fetched and ownership verified by middleware
        const tokens = req.tokens

        // Verify all tokens are active
        const inactiveTokens = tokens.filter(t => t.status !== 'active')
        if (inactiveTokens.length > 0) {
            return res.status(400).json({
                error: 'All tokens must be active',
                inactive: inactiveTokens.map(t => t.id)
            })
        }

        // Verify all tokens have same purity
        const purities = [...new Set(tokens.map(t => t.purity))]
        if (purities.length > 1) {
            return res.status(400).json({
                error: 'All tokens must have the same purity',
                purities_found: purities
            })
        }

        // Calculate total weight
        const totalParentWeight = tokens.reduce((sum, t) => sum + parseFloat(t.weight), 0)

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

            if (wastage.approval_status === 'rejected') {
                return res.status(400).json({ error: 'Wastage was rejected' })
            }

            wastageWeight = parseFloat(wastage.wastage_weight)
        }

        // Calculate merged weight
        const mergedWeight = totalParentWeight - wastageWeight

        if (mergedWeight <= 0) {
            return res.status(400).json({ error: 'Merged weight must be positive' })
        }

        // Create merged token
        const mergedTokenId = generateTokenId()

        const { data: mergedToken, error: mergeError } = await supabase
            .from('tokens')
            .insert({
                token_id: mergedTokenId,
                batch_id: tokens[0].batch_id, // Use first token's batch (all from same lineage ideally)
                weight: mergedWeight,
                purity: tokens[0].purity,
                status: 'active',
                current_owner_id: tokens[0].current_owner_id,
                minted_by_id: userId
            })
            .select()
            .single()

        if (mergeError) {
            console.error('Merge token creation error:', mergeError)
            return res.status(500).json({ error: 'Failed to create merged token' })
        }

        // Create lineage entries for each parent
        for (const token of tokens) {
            await supabase
                .from('token_lineage')
                .insert({
                    child_token_id: mergedToken.id,
                    parent_token_id: token.id,
                    operation_type: 'merge',
                    weight_transferred: token.weight,
                    performed_by_id: userId
                })

            // Mark parent as merged
            await supabase
                .from('tokens')
                .update({ status: 'merged' })
                .eq('id', token.id)
        }

        // Log merge action
        await logAction(
            userId,
            'merge_token',
            'token',
            mergedToken.id,
            { parent_count: tokens.length, parent_token_ids: token_ids, wastage_weight: wastageWeight },
            req.ip
        )

        res.status(201).json({
            merged_token: mergedToken,
            parent_tokens: tokens.map(t => ({ id: t.id, weight: t.weight, status: 'merged' }))
        })

    } catch (error) {
        console.error('Merge tokens error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * POST /api/tokens/:id/transfer
 * Transfer token ownership
 * Authorization: Requires ownership (only current owner can transfer)
 */
export const transferToken = async (req, res) => {
    try {
        const tokenId = req.params.id
        const { to_participant_id, notes = '' } = req.body
        const userId = req.user.id

        if (!to_participant_id) {
            return res.status(400).json({ error: 'to_participant_id required' })
        }

        // Token already fetched and ownership verified by middleware
        const token = req.token

        if (token.status !== 'active') {
            return res.status(400).json({ error: 'Can only transfer active tokens' })
        }

        // Verify recipient exists and is active
        const { data: recipient, error: recipientError } = await supabase
            .from('participants')
            .select('id, name, active')
            .eq('id', to_participant_id)
            .single()

        if (recipientError || !recipient) {
            return res.status(404).json({ error: 'Recipient participant not found' })
        }

        if (!recipient.active) {
            return res.status(400).json({ error: 'Recipient is inactive' })
        }

        // Update token owner
        const { error: updateError } = await supabase
            .from('tokens')
            .update({ current_owner_id: to_participant_id })
            .eq('id', tokenId)

        if (updateError) {
            console.error('Token update error:', updateError)
            return res.status(500).json({ error: 'Failed to update token' })
        }

        // Record transfer
        const { data: transfer, error: transferError } = await supabase
            .from('token_transfers')
            .insert({
                token_id: tokenId,
                from_participant_id: token.current_owner_id,
                to_participant_id: to_participant_id,
                notes: notes
            })
            .select()
            .single()

        if (transferError) {
            console.error('Transfer record error:', transferError)
        }

        // Log transfer action
        await logAction(
            userId,
            'transfer_token',
            'token',
            tokenId,
            { from: token.current_owner_id, to: to_participant_id, notes },
            req.ip
        )

        res.json({
            message: 'Token transferred successfully',
            token_id: token.token_id,
            from: token.current_owner_id,
            to: to_participant_id,
            transfer: transfer
        })

    } catch (error) {
        console.error('Transfer token error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

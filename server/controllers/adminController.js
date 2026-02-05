import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * GET /api/admin/stats
 * Get comprehensive system statistics
 */
export const getStats = async (req, res) => {
    try {
        // 1. Get Token Stats
        const { data: tokens, error: tokensError } = await supabase
            .from('tokens')
            .select('weight, status')

        if (tokensError) throw tokensError

        // 2. Get Product Stats
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('net_gold_weight')

        if (productsError) throw productsError

        // 3. Get Participants
        const { count: participantCount, error: pError } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })

        if (pError) throw pError

        // 4. Calculate Aggregates
        const totalWeight = tokens.reduce((sum, t) => sum + (parseFloat(t.weight) || 0), 0) +
            products.reduce((sum, p) => sum + (parseFloat(p.net_gold_weight) || 0), 0)

        res.json({
            totalTokens: tokens.length,
            activeTokens: tokens.filter(t => t.status === 'active').length,
            totalProducts: products.length,
            totalParticipants: participantCount,
            totalGoldWeight: totalWeight.toFixed(2),
            wastageRules: {
                casting: 0.02,
                handmade: 0.05,
                filigree: 0.10
            }
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/admin/participants
 * List all registered parties
 */
export const getParticipants = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .order('name', { ascending: true })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/admin/audit-logs
 * Fetch system-wide activity logs
 */
export const getAuditLogs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('audit_log')
            .select(`
                *,
                user:participants!performed_by_id(name, role)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/admin/tokens
 */
export const getTokens = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tokens')
            .select(`
                *,
                owner:participants!current_owner_id(name, role),
                minter:participants!minted_by_id(name, role)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/admin/products
 */
export const getProducts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                craftsman:participants!craftsman_id(name, role)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/admin/wastage
 */
export const getWastageLogs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('wastage_logs')
            .select(`
                *,
                craftsman:participants!craftsman_id(name, role),
                approver:participants!approved_by_id(name, role)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/admin/db/tables
 * List all protocol tables
 */
export const getDbTables = async (req, res) => {
    try {
        const tables = [
            { name: 'participants', description: 'Supply Chain Actors & Roles' },
            { name: 'gold_batches', description: 'Raw Metal Entry Batches' },
            { name: 'tokens', description: 'Digital Gold Tokens (Ledger)' },
            { name: 'token_lineage', description: 'Split/Merge Heritage Tree' },
            { name: 'token_transfers', description: 'Chain of Custody History' },
            { name: 'products', description: 'Finished Jewellery Goods' },
            { name: 'product_token_composition', description: 'Product-to-Token Mapping' },
            { name: 'wastage_logs', description: 'Production Mass Variation Logs' },
            { name: 'wastage_thresholds', description: 'Compliance & Audit Rules' },
            { name: 'audit_log', description: 'Immutable System Mutation Log' }
        ]
        res.json(tables)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/admin/db/raw/:tableName
 */
export const getRawTableData = async (req, res) => {
    try {
        const { tableName } = req.params
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

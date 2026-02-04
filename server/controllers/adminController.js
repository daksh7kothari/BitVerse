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
            .from('audit_logs')
            .select(`
                *,
                user:participants!participant_id(name, role)
            `)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

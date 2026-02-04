import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export const getStats = async (req, res) => {
    try {
        const { count: certsCount, error: countError } = await supabase
            .from('gold_batches')
            .select('*', { count: 'exact', head: true })

        if (countError) throw countError

        const { data: owners, error: ownerError } = await supabase
            .from('gold_batches')
            .select('current_owner')

        if (ownerError) throw ownerError

        const uniquePartners = new Set(owners.map(o => o.current_owner)).size + 5

        res.json({
            verifiedPartners: uniquePartners,
            totalCerts: certsCount
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

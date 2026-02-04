import express from 'express'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// GET /api/participants - Fetch all active participants (for transfer selection)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('id, name, role')
            .eq('active', true)
            .order('name')

        if (error) throw error
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router

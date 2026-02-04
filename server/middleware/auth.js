import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ error: 'Missing authorization header' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' })
    }
}

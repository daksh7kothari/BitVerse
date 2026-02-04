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

        // Attach user to request
        req.user = user

        // For development: mock participant if using test mode
        // TODO: Remove this and require proper participant mapping in production
        if (process.env.NODE_ENV === 'development') {
            // Try to find participant by email match or create mock
            const { data: participant } = await supabase
                .from('participants')
                .select('id, name, role')
                .eq('contact_info->>email', user.email)
                .single()

            if (participant) {
                req.user.id = participant.id // Override user ID with participant ID
            }
        }

        next()
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' })
    }
}

// Export alias for consistency
export const authenticate = requireAuth

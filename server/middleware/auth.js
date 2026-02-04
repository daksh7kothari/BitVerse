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
        // DEVELOPMENT ONLY: Mock Authentication
        if (process.env.NODE_ENV !== 'production' && token.startsWith('mock-')) {
            const role = token.replace('mock-', '')

            // Map common roles to known IDs (matching migration/seed data)
            const MOCK_IDS = {
                'refiner': '9f53546e-67a2-4d0e-bd43-131479a64c62',
                'craftsman': 'b3cf56b8-4dc0-4081-9069-2d34d55438e0',
                'lab': '3fb85466-33f9-4ca8-a995-2bf27528e808',
                'admin': '505377c0-cb91-474f-9806-fc305ddc0078',
                'jeweller': 'e3cf56b8-4dc0-4081-9069-2d34d55438e0'
            }

            const mockId = MOCK_IDS[role]

            if (mockId) {
                // Verify participant exists in DB
                const { data: participant } = await supabase
                    .from('participants')
                    .select('id, name, role, permissions')
                    .eq('id', mockId)
                    .single()

                if (participant) {
                    req.user = { id: participant.id, email: `${role}@bitverse.mock` }
                    req.participant = participant
                    return next()
                }
            }
        }

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
                .select('id, name, role, permissions') // Added permissions to selection
                .eq('contact_info->>email', user.email)
                .single()

            if (participant) {
                req.user.id = participant.id // Override user ID with participant ID
                req.participant = participant // Attach participant directly
            }
        }

        next()
    } catch (error) {
        console.error('Auth error:', error)
        return res.status(401).json({ error: 'Authentication failed' })
    }
}

// Export alias for consistency
export const authenticate = requireAuth

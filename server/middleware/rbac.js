import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * RBAC Permission Matrix
 * Defines what actions each role can perform
 */
export const PERMISSIONS = {
    admin: [
        'mint_token',
        'split_token',
        'merge_token',
        'transfer_token',
        'approve_wastage',
        'reject_wastage',
        'update_thresholds',
        'view_all',
        'create_product'
    ],
    refiner: [
        'mint_token',
        'merge_token',
        'transfer_token',
        'view_own',
        'create_product'
    ],
    craftsman: [
        'split_token',
        'merge_token',
        'log_wastage',
        'transfer_token',
        'view_own',
        'create_product'
    ],
    lab: [
        'approve_wastage',
        'reject_wastage',
        'view_all'
    ],
    auditor: [
        'view_all',
        'generate_reports'
    ],
    customer: [
        'view_public_trace'
    ]
}

/**
 * Middleware: Require specific permission
 * Checks if user has the required permission based on their role
 */
export const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = req.user // Set by auth middleware

            if (!user) {
                return res.status(401).json({ error: 'Authentication required' })
            }

            // Get user's participant record with role
            const { data: participant, error } = await supabase
                .from('participants')
                .select('id, role, active, permissions')
                .eq('id', user.id)
                .single()

            if (error || !participant) {
                return res.status(404).json({ error: 'Participant not found' })
            }

            if (!participant.active) {
                return res.status(403).json({ error: 'Account is inactive' })
            }

            // Check role-based permissions
            const rolePermissions = PERMISSIONS[participant.role] || []

            // Check custom participant-level permissions (override)
            const customPermissions = participant.permissions || {}
            const hasCustomPermission = customPermissions[permission] === true

            if (!rolePermissions.includes(permission) && !hasCustomPermission) {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    required: permission,
                    role: participant.role
                })
            }

            // Attach participant info to request for later use
            req.participant = participant
            next()
        } catch (err) {
            console.error('Permission check error:', err)
            res.status(500).json({ error: 'Permission check failed' })
        }
    }
}

/**
 * Middleware: Require token ownership
 * Validates that the user is the current owner of the token
 */
export const requireOwnership = async (req, res, next) => {
    try {
        const tokenId = req.params.id
        const user = req.user

        if (!user) {
            return res.status(401).json({ error: 'Authentication required' })
        }

        const { data: token, error } = await supabase
            .from('tokens')
            .select('id, current_owner_id, status')
            .eq('id', tokenId)
            .single()

        if (error || !token) {
            return res.status(404).json({ error: 'Token not found' })
        }

        if (token.current_owner_id !== user.id) {
            return res.status(403).json({
                error: 'You do not own this token',
                owner_id: token.current_owner_id
            })
        }

        // Attach token to request for controller use
        req.token = token
        next()
    } catch (err) {
        console.error('Ownership check error:', err)
        res.status(500).json({ error: 'Ownership verification failed' })
    }
}

/**
 * Middleware: Require ownership of multiple tokens
 * Used for merge operations where user must own all input tokens
 */
export const requireMultipleOwnership = (tokenIdsField = 'token_ids') => {
    return async (req, res, next) => {
        try {
            const tokenIds = req.body[tokenIdsField]
            const user = req.user

            if (!user) {
                return res.status(401).json({ error: 'Authentication required' })
            }

            if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
                return res.status(400).json({ error: 'Invalid token IDs array' })
            }

            // Fetch all tokens
            const { data: tokens, error } = await supabase
                .from('tokens')
                .select('id, current_owner_id, status, purity')
                .in('id', tokenIds)

            if (error || !tokens || tokens.length !== tokenIds.length) {
                return res.status(404).json({ error: 'One or more tokens not found' })
            }

            // Check ownership of all tokens
            const notOwned = tokens.filter(t => t.current_owner_id !== user.id)
            if (notOwned.length > 0) {
                return res.status(403).json({
                    error: 'You do not own all specified tokens',
                    not_owned: notOwned.map(t => t.id)
                })
            }

            // Attach tokens to request
            req.tokens = tokens
            next()
        } catch (err) {
            console.error('Multi-ownership check error:', err)
            res.status(500).json({ error: 'Ownership verification failed' })
        }
    }
}

/**
 * Audit Logging Helper
 * Logs all mutation operations to audit_log table
 */
export const logAction = async (performedById, actionType, resourceType, resourceId, details = {}, ipAddress = null) => {
    try {
        const { error } = await supabase
            .from('audit_log')
            .insert({
                performed_by_id: performedById,
                action_type: actionType,
                resource_type: resourceType,
                resource_id: resourceId,
                details: details,
                ip_address: ipAddress
            })

        if (error) {
            console.error('Audit logging failed:', error)
            // Don't throw - audit failure shouldn't break the operation
        }
    } catch (err) {
        console.error('Audit logging exception:', err)
    }
}

/**
 * Middleware: Auto-log all mutation actions
 * Automatically logs POST/PUT/DELETE requests to audit_log
 */
export const autoLogAction = (actionType, resourceType) => {
    return async (req, res, next) => {
        // Store original res.json to intercept successful responses
        const originalJson = res.json.bind(res)

        res.json = function (data) {
            // Only log on successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const resourceId = data.id || req.params.id || null
                const userId = req.user?.id || req.participant?.id

                if (userId && resourceId) {
                    logAction(
                        userId,
                        actionType,
                        resourceType,
                        resourceId,
                        { method: req.method, path: req.path },
                        req.ip
                    )
                }
            }

            return originalJson(data)
        }

        next()
    }
}

/**
 * Helper: Check if user has admin role
 */
export const isAdmin = (participant) => {
    return participant && participant.role === 'admin'
}

/**
 * Helper: Check if user has lab role
 */
export const isLab = (participant) => {
    return participant && (participant.role === 'lab' || participant.role === 'auditor')
}

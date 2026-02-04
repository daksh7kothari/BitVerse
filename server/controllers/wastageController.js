import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { logAction } from '../middleware/rbac.js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * POST /api/wastage/log
 * Log wastage with dynamic threshold validation
 * Authorization: Requires 'log_wastage' permission (craftsman)
 */
export const logWastage = async (req, res) => {
    try {
        const { token_id, operation_type, expected_weight, actual_weight, craftsman_id } = req.body
        const userId = req.user.id

        // Validate required fields
        if (!operation_type || expected_weight == null || actual_weight == null) {
            return res.status(400).json({
                error: 'Missing required fields: operation_type, expected_weight, actual_weight'
            })
        }

        // Validate weights
        if (isNaN(expected_weight) || expected_weight <= 0) {
            return res.status(400).json({ error: 'expected_weight must be a positive number' })
        }

        if (isNaN(actual_weight) || actual_weight < 0) {
            return res.status(400).json({ error: 'actual_weight must be non-negative' })
        }

        // Validate operation_type
        const validOperations = ['casting', 'handmade', 'filigree', 'split', 'merge', 'other']
        if (!validOperations.includes(operation_type)) {
            return res.status(400).json({
                error: 'Invalid operation_type',
                valid_types: validOperations
            })
        }

        // Calculate wastage percentage
        const wastageWeight = expected_weight - actual_weight
        const wastagePercentage = (wastageWeight / expected_weight) * 100

        // Get dynamic threshold for operation type
        const { data: threshold, error: thresholdError } = await supabase
            .from('wastage_thresholds')
            .select('auto_approve_max, review_required_max')
            .eq('operation_type', operation_type)
            .single()

        if (thresholdError) {
            console.error('Threshold lookup error:', thresholdError)
            return res.status(500).json({ error: 'Failed to lookup wastage threshold' })
        }

        // Determine approval status based on threshold
        let approvalStatus
        if (wastagePercentage <= threshold.auto_approve_max) {
            approvalStatus = 'auto_approved'
        } else if (wastagePercentage <= threshold.review_required_max) {
            approvalStatus = 'pending_review'
        } else {
            approvalStatus = 'flagged_for_audit'
        }

        // Create wastage log
        const { data: wastageLog, error: logError } = await supabase
            .from('wastage_logs')
            .insert({
                token_id: token_id || null,
                operation_type: operation_type,
                expected_weight: expected_weight,
                actual_weight: actual_weight,
                craftsman_id: craftsman_id || userId,
                approval_status: approvalStatus,
                approved_by_id: approvalStatus === 'auto_approved' ? userId : null,
                approved_at: approvalStatus === 'auto_approved' ? new Date().toISOString() : null
            })
            .select()
            .single()

        if (logError) {
            console.error('Wastage log creation error:', logError)
            return res.status(500).json({ error: 'Failed to create wastage log' })
        }

        res.status(201).json({
            ...wastageLog,
            threshold_used: threshold,
            message: approvalStatus === 'auto_approved'
                ? 'Wastage auto-approved'
                : approvalStatus === 'pending_review'
                    ? 'Wastage requires lab review'
                    : 'Wastage flagged for mandatory audit'
        })

    } catch (error) {
        console.error('Log wastage error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * POST /api/wastage/:id/approve
 * Lab approval for pending wastage
 * Authorization: Requires 'approve_wastage' permission (lab/auditor only)
 */
export const approveWastage = async (req, res) => {
    try {
        const wastageId = req.params.id
        const { approved, approval_notes = '' } = req.body
        const userId = req.user.id

        if (typeof approved !== 'boolean') {
            return res.status(400).json({ error: 'approved field is required (true/false)' })
        }

        // Get wastage log
        const { data: wastageLog, error: fetchError } = await supabase
            .from('wastage_logs')
            .select('*')
            .eq('id', wastageId)
            .single()

        if (fetchError || !wastageLog) {
            return res.status(404).json({ error: 'Wastage log not found' })
        }

        // Check if already approved/rejected
        const finalStatuses = ['approved', 'rejected', 'auto_approved']
        if (finalStatuses.includes(wastageLog.approval_status)) {
            return res.status(400).json({
                error: 'Wastage already processed',
                current_status: wastageLog.approval_status
            })
        }

        // Update approval status
        const newStatus = approved ? 'approved' : 'rejected'

        const { data: updated, error: updateError } = await supabase
            .from('wastage_logs')
            .update({
                approval_status: newStatus,
                approved_by_id: userId,
                approval_notes: approval_notes,
                approved_at: new Date().toISOString()
            })
            .eq('id', wastageId)
            .select()
            .single()

        if (updateError) {
            console.error('Wastage update error:', updateError)
            return res.status(500).json({ error: 'Failed to update wastage log' })
        }

        // Log approval action
        await logAction(
            userId,
            approved ? 'approve_wastage' : 'reject_wastage',
            'wastage_log',
            wastageId,
            { approval_notes, wastage_percentage: wastageLog.wastage_percentage },
            req.ip
        )

        res.json({
            ...updated,
            message: approved ? 'Wastage approved' : 'Wastage rejected'
        })

    } catch (error) {
        console.error('Approve wastage error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * GET /api/wastage/thresholds
 * Get current wastage thresholds
 * Authorization: Public (read-only)
 */
export const getThresholds = async (req, res) => {
    try {
        const { data: thresholds, error } = await supabase
            .from('wastage_thresholds')
            .select('*')
            .order('operation_type')

        if (error) {
            throw error
        }

        res.json(thresholds)

    } catch (error) {
        console.error('Get thresholds error:', error)
        res.status(500).json({ error: 'Failed to fetch thresholds' })
    }
}

/**
 * PUT /api/wastage/thresholds/:operation_type
 * Update threshold configuration
 * Authorization: Requires 'update_thresholds' permission (admin only)
 */
export const updateThreshold = async (req, res) => {
    try {
        const { operation_type } = req.params
        const { auto_approve_max, review_required_max } = req.body
        const userId = req.user.id

        // Validate threshold values
        if (auto_approve_max == null || review_required_max == null) {
            return res.status(400).json({
                error: 'Both auto_approve_max and review_required_max are required'
            })
        }

        if (auto_approve_max < 0 || review_required_max < auto_approve_max) {
            return res.status(400).json({
                error: 'Invalid threshold values',
                constraints: 'auto_approve_max >= 0 and review_required_max >= auto_approve_max'
            })
        }

        // Update threshold
        const { data: threshold, error: updateError } = await supabase
            .from('wastage_thresholds')
            .update({
                auto_approve_max: auto_approve_max,
                review_required_max: review_required_max,
                updated_by_id: userId
            })
            .eq('operation_type', operation_type)
            .select()
            .single()

        if (updateError) {
            console.error('Threshold update error:', updateError)
            return res.status(500).json({ error: 'Failed to update threshold' })
        }

        // Log threshold update
        await logAction(
            userId,
            'update_threshold',
            'threshold',
            threshold.id,
            { operation_type, auto_approve_max, review_required_max },
            req.ip
        )

        res.json({
            ...threshold,
            message: 'Threshold updated successfully'
        })

    } catch (error) {
        console.error('Update threshold error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
/**
 * GET /api/wastage/logs
 * List all wastage logs with details
 */
export const getWastageLogs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('wastage_logs')
            .select(`
                *,
                craftsman:participants!craftsman_id(name, role),
                token:tokens(token_id, weight, purity)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        console.error('Get wastage logs error:', error)
        res.status(500).json({ error: 'Failed to fetch wastage logs' })
    }
}

import express from 'express'
import { requirePermission } from '../middleware/rbac.js'
import * as wastageController from '../controllers/wastageController.js'

const router = express.Router()

// POST /api/wastage/log - Log wastage (craftsman)
router.post('/log', requirePermission('log_wastage'), wastageController.logWastage)

// POST /api/wastage/:id/approve - Approve/reject wastage (lab/auditor only)
router.post('/:id/approve', requirePermission('approve_wastage'), wastageController.approveWastage)

// GET /api/wastage/logs - List all wastage logs (lab/admin)
router.get('/logs', requirePermission('approve_wastage'), wastageController.getWastageLogs)

// GET /api/wastage/thresholds - Get thresholds (public)
router.get('/thresholds', wastageController.getThresholds)

// PUT /api/wastage/thresholds/:operation_type - Update threshold (admin only)
router.put('/thresholds/:operation_type', requirePermission('update_thresholds'), wastageController.updateThreshold)

export default router

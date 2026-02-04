import express from 'express'
import { requirePermission } from '../middleware/rbac.js'
import * as adminController from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require 'view_all' or higher admin permission
router.get('/stats', requirePermission('view_all'), adminController.getStats)
router.get('/participants', requirePermission('view_all'), adminController.getParticipants)
router.get('/audit-logs', requirePermission('view_all'), adminController.getAuditLogs)

export default router

import express from 'express'
import { getBatches, createBatch, transferBatch, getBatchHistory } from '../controllers/batchController.js'
// import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Public Routes (Verified via public portal)
router.get('/:id/history', getBatchHistory)

// Protected Routes (Jewellers only)
// Note: enable requireAuth when frontend sends tokens
// router.use(requireAuth)
router.get('/', getBatches)
router.post('/', createBatch)
router.post('/transfer', transferBatch)

export default router

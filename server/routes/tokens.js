import express from 'express'
import { requirePermission, requireOwnership, requireMultipleOwnership } from '../middleware/rbac.js'
import * as tokenController from '../controllers/tokenController.js'

const router = express.Router()

// POST /api/tokens/mint - Assisted token minting (refiner/admin only)
router.post('/mint', requirePermission('mint_token'), tokenController.mintToken)

// GET /api/tokens - List tokens (filtered by ownership)
router.get('/', tokenController.getTokens)

// POST /api/tokens/:id/split - Split token (craftsman + ownership required)
router.post('/:id/split', requirePermission('split_token'), requireOwnership, tokenController.splitToken)

// POST /api/tokens/merge - Merge tokens (craftsman/refiner + ownership of all)
router.post('/merge', requirePermission('merge_token'), requireMultipleOwnership('token_ids'), tokenController.mergeTokens)

// POST /api/tokens/:id/transfer - Transfer ownership (owner only)
router.post('/:id/transfer', requireOwnership, tokenController.transferToken)

export default router

import express from 'express'
import { requirePermission } from '../middleware/rbac.js'
import * as productController from '../controllers/productController.js'

const router = express.Router()

// POST /api/products/create - Create product (craftsman)
router.post('/create', requirePermission('create_product'), productController.createProduct)

// GET /api/products/:id - Get product details (public)
router.get('/:id', productController.getProduct)

// GET /api/products/:id/trace - Full traceability (public QR endpoint)
router.get('/:id/trace', productController.traceProduct)

export default router

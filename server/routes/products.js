import express from 'express'
import { requirePermission } from '../middleware/rbac.js'
import * as productController from '../controllers/productController.js'

const router = express.Router()

// POST /api/products/create - Create product (craftsman)
router.post('/create', requirePermission('create_product'), productController.createProduct)

// GET /api/products/my - Get craftsman's products
router.get('/my', requirePermission('view_own'), productController.getMyProducts)

// GET /api/products - List all products
router.get('/', requirePermission('view_own'), productController.getProducts)

// GET /api/products/:id - Get product details (public)
router.get('/:id', productController.getProduct)

// POST /api/products/:id/transfer - Transfer product ownership
router.post('/:id/transfer', requirePermission('transfer_token'), productController.transferProduct)

// GET /api/products/:id/trace - Full traceability (public QR endpoint)
router.get('/:id/trace', productController.traceProduct)

export default router

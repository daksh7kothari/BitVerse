import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import batchesRoutes from './routes/batches.js'
import adminRoutes from './routes/admin.js'
import tokensRoutes from './routes/tokens.js'
import productsRoutes from './routes/products.js'
import wastageRoutes from './routes/wastage.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authenticate } from './middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health Check
app.get('/', (req, res) => {
    res.send('BitVerse API Running - Token Traceability System Active')
})

// Legacy Routes
app.use('/api/batches', batchesRoutes)
app.use('/api/admin', adminRoutes)

// New Token Traceability Routes (with authentication)
app.use('/api/tokens', authenticate, tokensRoutes)
app.use('/api/products', authenticate, productsRoutes)
app.use('/api/wastage', authenticate, wastageRoutes)

// Public route for QR code traceability (no auth required)
app.get('/api/products/:id/trace-public', async (req, res) => {
    // Forward to trace endpoint without auth
    req.url = `/api/products/${req.params.id}/trace`
    productsRoutes(req, res)
})

// Error Handling
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`✅ BitVerse Server running on port ${PORT}`)
    console.log(`📊 Token traceability enabled`)
    console.log(`🔒 RBAC enforcement active`)
    console.log(`⚖️  Mass balance validation: ±0.01g tolerance`)
})

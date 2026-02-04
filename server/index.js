import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import batchesRoutes from './routes/batches.js'
import adminRoutes from './routes/admin.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health Check
app.get('/', (req, res) => {
    res.send('BitVerse API Running')
})

// Routes
app.use('/api/batches', batchesRoutes)
app.use('/api/admin', adminRoutes)

// Error Handling
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

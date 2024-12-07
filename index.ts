import cors from 'cors'
import express, { json } from 'express'
import aiRoutes from './routes/ai'
import authRoutes from './routes/auth'

const app = express()
const port = process.env.PORT || 5001

// middlewares
app.use(cors())
app.use((req, res, next) => {
	if (req.method !== 'GET') json()(req, res, next)
	else next()
})

// routes
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)

app.listen(port, () => {
	console.log(`listening to server on port ${port}`)
})

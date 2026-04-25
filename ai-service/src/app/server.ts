import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { registerRoutes } from './routes'

dotenv.config()

export function createServer() {
  const app = express()
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  app.set('trust proxy', process.env.TRUST_PROXY || 1)
  app.use(helmet())
  app.use(cors({ origin: [frontendUrl], credentials: true }))
  app.use(express.json({ limit: '5mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(morgan('combined'))

  registerRoutes(app)

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Route ${req.originalUrl} not found`,
    })
  })

  return app
}

import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { createDynamicRateLimiter } from '../modules/rate-limit/rate-limit.controller'
import { registerRoutes } from './routes'

function parseTrustProxy(value: string | undefined): boolean | number | string {
  if (!value) return 1
  if (value === 'true') return true
  if (value === 'false') return false

  const numericValue = Number(value)
  return Number.isInteger(numericValue) ? numericValue : value
}

export function createApp() {
  const app = express()

  app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY))
  app.use(helmet())
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }))
  app.use(morgan('combined'))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use('/api/', createDynamicRateLimiter())
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

  registerRoutes(app)

  return app
}

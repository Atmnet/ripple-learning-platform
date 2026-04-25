import { Application } from 'express'
import aiAssistantRoutes from '../routes/aiAssistant'
import mockInterviewRoutes from '../routes/mockInterview'
import { getHealthSnapshot } from './health'

export function registerRoutes(app: Application): void {
  app.use('/api/ai-assistant', aiAssistantRoutes)
  app.use('/api/mock-interview', mockInterviewRoutes)

  app.get('/health/live', (_req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() })
  })

  app.get('/health/ready', async (_req, res) => {
    const snapshot = await getHealthSnapshot()
    res.status(snapshot.ready ? 200 : 503).json({
      status: snapshot.ready ? 'READY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      checks: snapshot,
    })
  })

  app.get('/health', async (_req, res) => {
    const snapshot = await getHealthSnapshot()
    res.status(snapshot.ready ? 200 : 503).json({
      status: snapshot.ready ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      checks: snapshot,
    })
  })
}

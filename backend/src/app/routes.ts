import { Application } from 'express'
import adminDashboardRoutes from '../routes/adminDashboard'
import appSettingsRoutes from '../routes/appSettings'
import assignmentRoutes from '../routes/assignments'
import authRoutes from '../routes/auth'
import dailyReportRoutes from '../routes/daily-reports'
import documentRoutes from '../routes/documents'
import gradeRoutes from '../routes/grades'
import linuxExamRoutes from '../routes/linuxExam'
import linuxLearningRoutes from '../routes/linuxLearning'
import rateLimitRoutes from '../routes/rate-limit'
import submissionsRoutes from '../routes/submissions'
import uploadRoutes from '../routes/upload'
import userRoutes from '../routes/users'
import videoResourceRoutes from '../routes/videoResources'
import { getHealthSnapshot } from './health'

export function registerRoutes(app: Application): void {
  app.use('/api/admin', adminDashboardRoutes)
  app.use('/api/app-settings', appSettingsRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/daily-reports', dailyReportRoutes)
  app.use('/api/assignments', assignmentRoutes)
  app.use('/api/submissions', submissionsRoutes)
  app.use('/api/documents', documentRoutes)
  app.use('/api/upload', uploadRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/rate-limit', rateLimitRoutes)
  app.use('/api/grades', gradeRoutes)
  app.use('/api/linux', linuxLearningRoutes)
  app.use('/api/linux-exam', linuxExamRoutes)
  app.use('/api/videos', videoResourceRoutes)

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

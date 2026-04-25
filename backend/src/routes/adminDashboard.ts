import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth'
import { getAdminDashboard } from '../modules/admin-dashboard/admin-dashboard.controller'

const router = Router()

router.get('/dashboard', authenticateToken, requireAdmin, getAdminDashboard)

export default router

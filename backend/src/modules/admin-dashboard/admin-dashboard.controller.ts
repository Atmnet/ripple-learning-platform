import { Response } from 'express'
import { sendError, sendSuccess } from '../../shared/utils/response'
import type { AuthRequest } from '../../middleware/auth'
import { adminDashboardService } from './admin-dashboard.service'

export async function getAdminDashboard(req: AuthRequest, res: Response) {
  try {
    const rangeDays = Number.parseInt(String(req.query.rangeDays || '7'), 10)
    const data = await adminDashboardService.getSnapshot(rangeDays)
    return sendSuccess(res, data)
  } catch (error) {
    console.error('Get admin dashboard error:', error)
    return sendError(res, error, 'Failed to load admin dashboard')
  }
}

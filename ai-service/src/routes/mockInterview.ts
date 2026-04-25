import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth'
import {
  getAllMockInterviewReports,
  getMockInterviewCategories,
  getMockInterviewQuestions,
  getMockInterviewReportDetail,
  getMockInterviewSession,
  getMyMockInterviewReports,
  startMockInterview,
  submitMockInterview,
} from '../modules/mock-interview/mock-interview.controller'

const router = Router()

router.get('/categories', authenticateToken, getMockInterviewCategories)
router.post('/sessions', authenticateToken, startMockInterview)
router.get('/sessions/:id', authenticateToken, getMockInterviewSession)
router.post('/sessions/:id/submit', authenticateToken, submitMockInterview)
router.get('/reports', authenticateToken, getMyMockInterviewReports)
router.get('/reports/:id', authenticateToken, getMockInterviewReportDetail)

router.get('/admin/questions', authenticateToken, requireAdmin, getMockInterviewQuestions)
router.get('/admin/reports', authenticateToken, requireAdmin, getAllMockInterviewReports)

export default router

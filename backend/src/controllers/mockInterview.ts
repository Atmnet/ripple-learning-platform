import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import {
  createInterviewSession,
  getAllInterviewReports,
  getInterviewCategories,
  getInterviewQuestions,
  getInterviewReport,
  getInterviewSession,
  getUserInterviewReports,
  submitInterviewSession
} from '../models/mockInterview'

export function getMockInterviewCategories(req: AuthRequest, res: Response): void {
  res.json({ success: true, data: getInterviewCategories() })
}

export function getMockInterviewQuestions(req: AuthRequest, res: Response): void {
  res.json({ success: true, data: getInterviewQuestions() })
}

export function startMockInterview(req: AuthRequest, res: Response): void {
  const { category = 'linux', count = 5 } = req.body || {}
  const result = createInterviewSession(req.user!.id, req.user!.real_name, category, Number(count) || 5)
  res.json({ success: true, data: result })
}

export function getMockInterviewSession(req: AuthRequest, res: Response): void {
  const session = getInterviewSession(req.params.id, req.user!.id)
  if (!session) {
    res.status(404).json({ success: false, error: '模拟面试会话不存在' })
    return
  }

  res.json({ success: true, data: session })
}

export function submitMockInterview(req: AuthRequest, res: Response): void {
  const { answers } = req.body || {}
  if (!Array.isArray(answers) || answers.length === 0) {
    res.status(400).json({ success: false, error: '请先提交回答内容' })
    return
  }

  const report = submitInterviewSession(req.params.id, req.user!.id, answers)
  if (!report) {
    res.status(404).json({ success: false, error: '模拟面试会话不存在' })
    return
  }

  res.json({ success: true, data: report })
}

export function getMyMockInterviewReports(req: AuthRequest, res: Response): void {
  res.json({ success: true, data: getUserInterviewReports(req.user!.id) })
}

export function getMockInterviewReportDetail(req: AuthRequest, res: Response): void {
  const report = getInterviewReport(req.params.id)
  if (!report) {
    res.status(404).json({ success: false, error: '模拟面试报告不存在' })
    return
  }

  if (req.user!.role !== 'admin' && report.userId !== req.user!.id) {
    res.status(403).json({ success: false, error: '无权查看该报告' })
    return
  }

  res.json({ success: true, data: report })
}

export function getAllMockInterviewReports(req: AuthRequest, res: Response): void {
  res.json({ success: true, data: getAllInterviewReports() })
}

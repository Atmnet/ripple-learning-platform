import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { sendError, sendSuccess } from '../../shared/utils/response'
import { mockInterviewService } from './mock-interview.service'

export function getMockInterviewCategories(_req: AuthRequest, res: Response): void {
  try {
    sendSuccess(res, mockInterviewService.getCategories())
  } catch (error) {
    sendError(res, error)
  }
}

export function getMockInterviewQuestions(_req: AuthRequest, res: Response): void {
  try {
    sendSuccess(res, mockInterviewService.getQuestions())
  } catch (error) {
    sendError(res, error)
  }
}

export function startMockInterview(req: AuthRequest, res: Response): void {
  try {
    const result = mockInterviewService.startInterview(
      req.user!.id,
      req.user!.real_name,
      req.body?.category,
      req.body?.count
    )
    sendSuccess(res, result)
  } catch (error) {
    sendError(res, error)
  }
}

export function getMockInterviewSession(req: AuthRequest, res: Response): void {
  try {
    const session = mockInterviewService.getSession(req.params.id, req.user!.id)
    sendSuccess(res, session)
  } catch (error) {
    sendError(res, error)
  }
}

export function submitMockInterview(req: AuthRequest, res: Response): void {
  try {
    const report = mockInterviewService.submitInterview(req.params.id, req.user!.id, req.body?.answers)
    sendSuccess(res, report)
  } catch (error) {
    sendError(res, error)
  }
}

export function getMyMockInterviewReports(req: AuthRequest, res: Response): void {
  try {
    sendSuccess(res, mockInterviewService.getMyReports(req.user!.id))
  } catch (error) {
    sendError(res, error)
  }
}

export function getMockInterviewReportDetail(req: AuthRequest, res: Response): void {
  try {
    const report = mockInterviewService.getReportDetail(req.params.id, req.user!.id, req.user!.role)
    sendSuccess(res, report)
  } catch (error) {
    sendError(res, error)
  }
}

export function getAllMockInterviewReports(_req: AuthRequest, res: Response): void {
  try {
    sendSuccess(res, mockInterviewService.getAllReports())
  } catch (error) {
    sendError(res, error)
  }
}

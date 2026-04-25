import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { sendError, sendMessage } from '../../shared/utils/response'
import { dailyReportService } from './daily-report.service'

export async function createDailyReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const report = await dailyReportService.createDailyReport(req.body.content, req.body.submit_date, req.user!)
    res.status(201).json(report)
  } catch (error) {
    console.error('Create daily report error:', error)
    sendError(res, error)
  }
}

export async function getDailyReports(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await dailyReportService.getDailyReports(req.query, req.user!)
    res.json(result)
  } catch (error) {
    console.error('Get daily reports error:', error)
    sendError(res, error)
  }
}

export async function getDailyReportById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const report = await dailyReportService.getDailyReportById(Number.parseInt(req.params.id, 10), req.user!)
    res.json(report)
  } catch (error) {
    console.error('Get daily report error:', error)
    sendError(res, error)
  }
}

export async function updateDailyReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const report = await dailyReportService.updateDailyReport(Number.parseInt(req.params.id, 10), req.body.content, req.user!)
    res.json(report)
  } catch (error) {
    console.error('Update daily report error:', error)
    sendError(res, error)
  }
}

export async function deleteDailyReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    await dailyReportService.deleteDailyReport(Number.parseInt(req.params.id, 10), req.user!)
    sendMessage(res, 'Report deleted successfully')
  } catch (error) {
    console.error('Delete daily report error:', error)
    sendError(res, error)
  }
}

export async function getTodayStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await dailyReportService.getTodayStatus(req.user!)
    res.json(result)
  } catch (error) {
    console.error('Get today status error:', error)
    sendError(res, error)
  }
}

export async function getAllUsersDailyStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await dailyReportService.getAllUsersDailyStatus(req.query.date)
    res.json(result)
  } catch (error) {
    console.error('Get all users daily status error:', error)
    sendError(res, error)
  }
}

export async function getComments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const comments = await dailyReportService.getComments(Number.parseInt(req.params.id, 10), req.user!)
    res.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
    sendError(res, error)
  }
}

export async function addComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const comment = await dailyReportService.addComment(Number.parseInt(req.params.id, 10), req.body, req.user!)
    res.status(201).json(comment)
  } catch (error) {
    console.error('Add comment error:', error)
    sendError(res, error)
  }
}

export async function updateComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const comment = await dailyReportService.updateComment(Number.parseInt(req.params.commentId, 10), req.body, req.user!)
    res.json(comment)
  } catch (error) {
    console.error('Update comment error:', error)
    sendError(res, error)
  }
}

export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    await dailyReportService.deleteComment(Number.parseInt(req.params.commentId, 10), req.user!)
    sendMessage(res, 'Comment deleted successfully')
  } catch (error) {
    console.error('Delete comment error:', error)
    sendError(res, error)
  }
}

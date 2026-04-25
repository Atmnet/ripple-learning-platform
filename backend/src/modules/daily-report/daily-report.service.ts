import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { DailyReportRepository } from './daily-report.repository'
import { AuthUser, DailyReportCommentPayload, DailyReportQuery } from './daily-report.types'

const dailyReportRepository = new DailyReportRepository()

function formatLocalDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseQueryDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function parseQueryNumber(value: unknown): number | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

export class DailyReportService {
  async createDailyReport(content: string, submitDate: string | undefined, user: AuthUser) {
    if (!content) {
      throw new AppError('Content is required', 400, ERROR_CODES.BAD_REQUEST)
    }

    const date = submitDate || formatLocalDate()
    const existingReport = await dailyReportRepository.findByUserIdAndDate(user.id, date)
    if (existingReport) {
      throw new AppError('今日日报已提交，如需修改请先撤回', 400, ERROR_CODES.DAILY_REPORT_ALREADY_SUBMITTED)
    }

    return dailyReportRepository.createDailyReport({
      user_id: user.id,
      content,
      submit_date: date,
      reviewed_at: null,
    })
  }

  async getDailyReports(query: DailyReportQuery, user: AuthUser) {
    const startDate = parseQueryDate(query.start)
    const endDate = parseQueryDate(query.end)
    const page = parseQueryNumber(query.page)
    const limit = parseQueryNumber(query.limit)
    const search = typeof query.search === 'string' ? query.search : undefined

    const result = user.role === 'admin'
      ? await dailyReportRepository.getDailyReports(startDate, endDate, page, limit, search)
      : await dailyReportRepository.getDailyReportsByUser(user.id, startDate, endDate, page, limit, search)

    let reports = result.data
    if (user.role === 'student' && reports.length > 0) {
      const unreadMap = await dailyReportRepository.getUnreadCountsByReportIds(reports.map((report) => report.id))
      reports = reports.map((report) => ({
        ...report,
        is_reviewed: !!report.reviewed_at,
        reviewed_at: report.reviewed_at,
        unread_comments: unreadMap.get(report.id) || 0,
      }))
    }

    return {
      data: reports,
      total: result.total,
      page: page || 1,
      limit: limit || reports.length,
    }
  }

  async getDailyReportById(reportId: number, user: AuthUser) {
    const report = await dailyReportRepository.getDailyReportById(reportId)

    if (!report) {
      throw new AppError('Report not found', 404, ERROR_CODES.DAILY_REPORT_NOT_FOUND)
    }

    if (report.user_id !== user.id && user.role !== 'admin') {
      throw new AppError('Access denied', 403, ERROR_CODES.FORBIDDEN)
    }

    if (user.role === 'admin' && report.user_id !== user.id) {
      await dailyReportRepository.markAsReviewed(report.id)
      report.reviewed_at = new Date().toISOString()
    }

    let unreadComments = 0
    if (user.role === 'student' && report.user_id === user.id) {
      unreadComments = await dailyReportRepository.getUnreadCount(report.id, user.id, user.role)
    }

    return {
      ...report,
      unread_comments: unreadComments,
    }
  }

  async updateDailyReport(reportId: number, content: string, user: AuthUser) {
    if (!content) {
      throw new AppError('Content is required', 400, ERROR_CODES.BAD_REQUEST)
    }

    const report = await dailyReportRepository.getDailyReportById(reportId)
    if (!report) {
      throw new AppError('Report not found', 404, ERROR_CODES.DAILY_REPORT_NOT_FOUND)
    }

    if (report.user_id !== user.id && user.role !== 'admin') {
      throw new AppError('Access denied', 403, ERROR_CODES.FORBIDDEN)
    }

    return dailyReportRepository.updateDailyReport(reportId, content)
  }

  async deleteDailyReport(reportId: number, user: AuthUser) {
    const report = await dailyReportRepository.getDailyReportById(reportId)
    if (!report) {
      throw new AppError('Report not found', 404, ERROR_CODES.DAILY_REPORT_NOT_FOUND)
    }

    if (report.user_id !== user.id && user.role !== 'admin') {
      throw new AppError('Access denied', 403, ERROR_CODES.FORBIDDEN)
    }

    if (user.role !== 'admin' && report.submit_date !== formatLocalDate()) {
      throw new AppError('只能撤回当天的日报', 400, ERROR_CODES.DAILY_REPORT_DELETE_DENIED)
    }

    await dailyReportRepository.deleteDailyReport(reportId)
  }

  async getTodayStatus(user: AuthUser) {
    const today = formatLocalDate()
    const reports = await dailyReportRepository.findByDate(today)
    const todayReport = reports.find((report) => report.user_id === user.id)

    let unreadComments = 0
    let isReviewed = false
    if (todayReport && user.role === 'student') {
      unreadComments = await dailyReportRepository.getUnreadCount(todayReport.id, user.id, user.role)
      isReviewed = !!todayReport.reviewed_at
    }

    return {
      has_submitted: !!todayReport,
      report: todayReport || null,
      date: today,
      is_reviewed: isReviewed,
      reviewed_at: todayReport?.reviewed_at || null,
      unread_comments: unreadComments,
    }
  }

  async getAllUsersDailyStatus(dateValue: unknown) {
    const queryDate = parseQueryDate(dateValue) || new Date()
    const dateStr = formatLocalDate(queryDate)
    const allUsers = await dailyReportRepository.getAllUsers()
    const students = allUsers.filter((user) => user.role === 'student')
    const reports = await dailyReportRepository.findByDate(dateStr)
    const commentCountMap = await dailyReportRepository.getCommentCountsByReportIds(reports.map((report) => report.id))

    const list = students.map((student) => {
      const report = reports.find((item) => item.user_id === student.id)
      return {
        user_id: student.id,
        username: student.username,
        real_name: student.real_name,
        has_submitted: !!report,
        report_id: report?.id || null,
        content: report?.content || null,
        submit_date: report?.submit_date || null,
        created_at: report?.created_at || null,
        reviewed_at: report?.reviewed_at || null,
        is_reviewed: !!report?.reviewed_at,
        comment_count: report ? (commentCountMap.get(report.id) || 0) : 0,
      }
    })

    return {
      date: dateStr,
      total: students.length,
      submitted: list.filter((item) => item.has_submitted).length,
      unsubmitted: list.filter((item) => !item.has_submitted).length,
      list,
    }
  }

  async getComments(reportId: number, user: AuthUser) {
    const report = await dailyReportRepository.getDailyReportById(reportId)
    if (!report) {
      throw new AppError('Report not found', 404, ERROR_CODES.DAILY_REPORT_NOT_FOUND)
    }

    if (report.user_id !== user.id && user.role !== 'admin') {
      throw new AppError('Access denied', 403, ERROR_CODES.FORBIDDEN)
    }

    const comments = await dailyReportRepository.getCommentsByReportId(reportId)
    if (report.user_id === user.id) {
      await dailyReportRepository.markCommentsAsReadForStudent(reportId)
    }

    return comments.map((comment) => ({
      ...comment,
      is_report_author: comment.user_id === report.user_id,
      is_current_user: comment.user_id === user.id,
    }))
  }

  async addComment(reportId: number, payload: DailyReportCommentPayload, user: AuthUser) {
    if (!payload.content || payload.content.trim() === '') {
      throw new AppError('Comment content is required', 400, ERROR_CODES.BAD_REQUEST)
    }

    const report = await dailyReportRepository.getDailyReportById(reportId)
    if (!report) {
      throw new AppError('Report not found', 404, ERROR_CODES.DAILY_REPORT_NOT_FOUND)
    }

    if (user.role !== 'admin' && report.user_id !== user.id) {
      throw new AppError('Access denied', 403, ERROR_CODES.FORBIDDEN)
    }

    return dailyReportRepository.createComment({
      report_id: reportId,
      user_id: user.id,
      content: payload.content.trim(),
    })
  }

  async updateComment(commentId: number, payload: DailyReportCommentPayload, user: AuthUser) {
    if (!payload.content || payload.content.trim() === '') {
      throw new AppError('Comment content is required', 400, ERROR_CODES.BAD_REQUEST)
    }

    const comment = await dailyReportRepository.getCommentById(commentId)
    if (!comment) {
      throw new AppError('Comment not found', 404, ERROR_CODES.COMMENT_NOT_FOUND)
    }

    if (comment.user_id !== user.id) {
      throw new AppError('Access denied', 403, ERROR_CODES.FORBIDDEN)
    }

    return dailyReportRepository.updateComment(commentId, payload.content.trim())
  }

  async deleteComment(commentId: number, user: AuthUser) {
    const comment = await dailyReportRepository.getCommentById(commentId)
    if (!comment) {
      throw new AppError('Comment not found', 404, ERROR_CODES.COMMENT_NOT_FOUND)
    }

    if (comment.user_id !== user.id && user.role !== 'admin') {
      throw new AppError('Access denied', 403, ERROR_CODES.FORBIDDEN)
    }

    await dailyReportRepository.deleteComment(commentId)
  }
}

export const dailyReportService = new DailyReportService()

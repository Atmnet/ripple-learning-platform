import { Request, Response } from 'express'
import { DailyReportModel } from '../models/DailyReport'
import { DailyReportCommentModel } from '../models/DailyReportComment'
import { UserModel } from '../models/User'

const dailyReportModel = new DailyReportModel()
const commentModel = new DailyReportCommentModel()
const userModel = new UserModel()

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const createDailyReport = async (req: any, res: Response) => {
  try {
    const { content, submit_date } = req.body
    const userId = req.user!.id

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    // 检查今日是否已提交
    const date = submit_date || formatLocalDate()
    const existingReport = await dailyReportModel.findByUserIdAndDate(userId, date)
    if (existingReport) {
      return res.status(400).json({ error: '今日日报已提交，如需修改请先撤回' })
    }

    const report = await dailyReportModel.create({
      user_id: userId,
      content,
      submit_date: date,
      reviewed_at: null
    })

    res.status(201).json(report)
  } catch (error) {
    console.error('Create daily report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getDailyReports = async (req: any, res: Response) => {
  try {
    const userId = req.user!.id
    const userRole = req.user!.role
    const startDate = req.query.start ? new Date(req.query.start) : undefined
    const endDate = req.query.end ? new Date(req.query.end) : undefined
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
    const search = typeof req.query.search === 'string' ? req.query.search : undefined

    let result
    if (userRole === 'admin') {
      result = await dailyReportModel.findAll(startDate, endDate, page, limit, search)
    } else {
      result = await dailyReportModel.findByUserId(userId, startDate, endDate, page, limit, search)
    }
    let reports = result.data

    if (userRole === 'student' && reports.length > 0) {
      const reportIds = reports.map(r => r.id)
      const unreadMap = await commentModel.getUnreadCountsByReportIds(reportIds)

      reports = reports.map(report => ({
        ...report,
        is_reviewed: !!report.reviewed_at,
        reviewed_at: report.reviewed_at,
        unread_comments: unreadMap.get(report.id) || 0
      }))
    }

    res.json({
      data: reports,
      total: result.total,
      page: page || 1,
      limit: limit || reports.length
    })
  } catch (error) {
    console.error('Get daily reports error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getDailyReportById = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const userRole = req.user!.role
    const report = await dailyReportModel.findById(parseInt(id))

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // 检查权限
    if (report.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    // 如果是老师查看学生的日报，自动标记为已阅
    if (userRole === 'admin' && report.user_id !== userId) {
      await dailyReportModel.markAsReviewed(report.id)
      report.reviewed_at = new Date().toISOString()
    }

    // 如果是学生查看自己的日报，添加未读评论数
    let unreadCount = 0
    if (userRole === 'student' && report.user_id === userId) {
      unreadCount = await commentModel.getUnreadCount(report.id, userId, userRole)
    }

    res.json({
      ...report,
      unread_comments: unreadCount
    })
  } catch (error) {
    console.error('Get daily report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateDailyReport = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    const report = await dailyReportModel.findById(parseInt(id))

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // 检查权限
    if (report.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updatedReport = await dailyReportModel.update(parseInt(id), content)
    res.json(updatedReport)
  } catch (error) {
    console.error('Update daily report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteDailyReport = async (req: any, res: Response) => {
  try {
    const { id } = req.params

    const report = await dailyReportModel.findById(parseInt(id))

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // 检查权限
    if (report.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (req.user!.role !== 'admin' && report.submit_date !== formatLocalDate()) {
      return res.status(400).json({ error: '只能撤回当天的日报' })
    }

    await dailyReportModel.delete(parseInt(id))
    res.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Delete daily report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getTodayStatus = async (req: any, res: Response) => {
  try {
    const userId = req.user!.id
    const userRole = req.user!.role
    const today = formatLocalDate()

    // 查询今日日报
    const reports = await dailyReportModel.findByDate(today)
    const todayReport = reports.find(r => r.user_id === userId)

    // 如果有今日日报且是学生，查询未读评论数
    let unreadComments = 0
    let isReviewed = false
    if (todayReport && userRole === 'student') {
      unreadComments = await commentModel.getUnreadCount(todayReport.id, userId, userRole)
      isReviewed = !!todayReport.reviewed_at
    }

    res.json({
      has_submitted: !!todayReport,
      report: todayReport || null,
      date: today,
      is_reviewed: isReviewed,
      reviewed_at: todayReport?.reviewed_at || null,
      unread_comments: unreadComments
    })
  } catch (error) {
    console.error('Get today status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
export const getAllUsersDailyStatus = async (req: any, res: Response) => {
  try {
    const { date } = req.query
    const queryDate = date ? new Date(date as string) : new Date()
    const dateStr = formatLocalDate(queryDate)

    // 获取所有学员
    const allUsers = await userModel.findAll()
    const students = allUsers.filter(user => user.role === 'student')

    // 获取指定日期的所有日报
    const reports = await dailyReportModel.findByDate(dateStr)

    // 批量获取所有日报的评论数量（优化N+1查询）
    const reportIds = reports.map(r => r.id)
    const commentCountMap = await commentModel.getCommentCountsByReportIds(reportIds)

    // 构建状态列表
    const statusList = students.map(student => {
      const report = reports.find(r => r.user_id === student.id)
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
        comment_count: report ? (commentCountMap.get(report.id) || 0) : 0
      }
    })

    res.json({
      date: dateStr,
      total: students.length,
      submitted: statusList.filter(s => s.has_submitted).length,
      unsubmitted: statusList.filter(s => !s.has_submitted).length,
      list: statusList
    })
  } catch (error) {
    console.error('Get all users daily status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ========== 日报评论相关接口 ==========

export const getComments = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const reportId = parseInt(id)
    const currentUserId = req.user!.id

    // 检查日报是否存在
    const report = await dailyReportModel.findById(reportId)
    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // 检查权限
    if (report.user_id !== currentUserId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const comments = await commentModel.findByReportId(reportId)

    // 标记评论为已读（如果是日报作者查看，且是老师发的评论）
    if (report.user_id === currentUserId) {
      await commentModel.markAsReadForStudent(reportId)
    }

    // 添加当前用户是否是日报作者的标记
    const commentsWithStatus = comments.map(comment => ({
      ...comment,
      is_report_author: comment.user_id === report.user_id,
      is_current_user: comment.user_id === currentUserId
    }))

    res.json(commentsWithStatus)
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const addComment = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const reportId = parseInt(id)
    const userId = req.user!.id

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    // 检查日报是否存在
    const report = await dailyReportModel.findById(reportId)
    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // 学生只能评论自己的日报，老师可以评论所有日报
    if (req.user!.role !== 'admin' && report.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const comment = await commentModel.create({
      report_id: reportId,
      user_id: userId,
      content: content.trim()
    })

    res.status(201).json(comment)
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateComment = async (req: any, res: Response) => {
  try {
    const { id, commentId } = req.params
    const { content } = req.body

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    const comment = await commentModel.findById(parseInt(commentId))
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // 只能修改自己的评论
    if (comment.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updatedComment = await commentModel.update(parseInt(commentId), content.trim())
    res.json(updatedComment)
  } catch (error) {
    console.error('Update comment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteComment = async (req: any, res: Response) => {
  try {
    const { commentId } = req.params

    const comment = await commentModel.findById(parseInt(commentId))
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // 只能删除自己的评论，管理员可以删除任何评论
    if (comment.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    await commentModel.delete(parseInt(commentId))
    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

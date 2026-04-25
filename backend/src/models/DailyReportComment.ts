import pool from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export interface DailyReportComment {
  id: number
  report_id: number
  user_id: number
  content: string
  is_read: boolean
  created_at: string
  updated_at: string
  user_name?: string
  user_role?: string
}

interface DailyReportCommentRow extends RowDataPacket, DailyReportComment {}

export class DailyReportCommentModel {
  async create(commentData: Omit<DailyReportComment, 'id' | 'created_at' | 'updated_at' | 'is_read'>): Promise<DailyReportComment> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO daily_report_comments (report_id, user_id, content) VALUES (?, ?, ?)',
      [commentData.report_id, commentData.user_id, commentData.content]
    )

    const [rows] = await pool.execute<DailyReportCommentRow[]>(
      `SELECT drc.*, u.real_name as user_name, u.role as user_role
       FROM daily_report_comments drc
       LEFT JOIN users u ON drc.user_id = u.id
       WHERE drc.id = ?`,
      [result.insertId]
    )

    return rows[0]
  }

  async findByReportId(reportId: number): Promise<DailyReportComment[]> {
    const [rows] = await pool.execute<DailyReportCommentRow[]>(
      `SELECT drc.*, u.real_name as user_name, u.role as user_role
       FROM daily_report_comments drc
       LEFT JOIN users u ON drc.user_id = u.id
       WHERE drc.report_id = ?
       ORDER BY drc.created_at ASC`,
      [reportId]
    )

    return rows
  }

  async findById(id: number): Promise<DailyReportComment | null> {
    const [rows] = await pool.execute<DailyReportCommentRow[]>(
      `SELECT drc.*, u.real_name as user_name, u.role as user_role
       FROM daily_report_comments drc
       LEFT JOIN users u ON drc.user_id = u.id
       WHERE drc.id = ?`,
      [id]
    )

    return rows[0] || null
  }

  async update(id: number, content: string): Promise<DailyReportComment | null> {
    await pool.execute(
      'UPDATE daily_report_comments SET content = ? WHERE id = ?',
      [content, id]
    )

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM daily_report_comments WHERE id = ?',
      [id]
    )

    return result.affectedRows > 0
  }

  async markAsRead(reportId: number): Promise<void> {
    await pool.execute(
      'UPDATE daily_report_comments SET is_read = TRUE WHERE report_id = ?',
      [reportId]
    )
  }

  async markAsReadForStudent(reportId: number): Promise<void> {
    // 学生查看时，只标记老师发的评论为已读
    await pool.execute(
      `UPDATE daily_report_comments drc
       JOIN users u ON drc.user_id = u.id
       SET drc.is_read = TRUE
       WHERE drc.report_id = ? AND u.role = 'admin' AND drc.is_read = FALSE`,
      [reportId]
    )
  }

  async getUnreadCount(reportId: number, _userId: number, userRole: string): Promise<number> {
    if (userRole === 'admin') {
      return 0
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count
       FROM daily_report_comments drc
       JOIN users u ON drc.user_id = u.id
       WHERE drc.report_id = ? AND u.role = 'admin' AND drc.is_read = FALSE`,
      [reportId]
    )
    return rows[0]?.count || 0
  }

  async getUnreadCountsByReportIds(reportIds: number[]): Promise<Map<number, number>> {
    if (reportIds.length === 0) {
      return new Map()
    }

    const placeholders = reportIds.map(() => '?').join(',')
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT drc.report_id, COUNT(*) as count
       FROM daily_report_comments drc
       JOIN users u ON drc.user_id = u.id
       WHERE drc.report_id IN (${placeholders}) AND u.role = 'admin' AND drc.is_read = FALSE
       GROUP BY drc.report_id`,
      reportIds
    )

    const countMap = new Map<number, number>()
    rows.forEach((row: any) => {
      countMap.set(row.report_id, row.count)
    })

    return countMap
  }

  async getCommentCountsByReportIds(reportIds: number[]): Promise<Map<number, number>> {
    if (reportIds.length === 0) {
      return new Map()
    }

    const placeholders = reportIds.map(() => '?').join(',')
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT report_id, COUNT(*) as count
       FROM daily_report_comments
       WHERE report_id IN (${placeholders})
       GROUP BY report_id`,
      reportIds
    )

    const countMap = new Map<number, number>()
    rows.forEach((row: any) => {
      countMap.set(row.report_id, row.count)
    })

    return countMap
  }
}

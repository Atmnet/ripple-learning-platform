import pool from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export interface DailyReport {
  id: number
  user_id: number
  content: string
  submit_date: string
  reviewed_at: string | null
  created_at: string
  updated_at: string
  user_name?: string
}

interface DailyReportRow extends RowDataPacket, DailyReport {}

interface CountRow extends RowDataPacket {
  total: number
}

export class DailyReportModel {
  private formatDateOnly(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  async create(reportData: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>): Promise<DailyReport> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO daily_reports (user_id, content, submit_date) VALUES (?, ?, ?)',
      [reportData.user_id, reportData.content, reportData.submit_date]
    )

    const [rows] = await pool.execute<DailyReportRow[]>(
      `SELECT dr.*, u.real_name as user_name
       FROM daily_reports dr
       LEFT JOIN users u ON dr.user_id = u.id
       WHERE dr.id = ?`,
      [result.insertId]
    )

    return rows[0]
  }

  async findAll(
    startDate?: Date,
    endDate?: Date,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{ data: DailyReport[]; total: number }> {
    let query = `
      SELECT dr.*, u.real_name as user_name
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
    `
    let countQuery = `
      SELECT COUNT(*) as total
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
    `
    const params: (string | number)[] = []
    const conditions: string[] = []

    if (startDate && endDate) {
      conditions.push('dr.submit_date BETWEEN ? AND ?')
      params.push(this.formatDateOnly(startDate), this.formatDateOnly(endDate))
    }

    if (search?.trim()) {
      conditions.push('(dr.content LIKE ? OR u.real_name LIKE ?)')
      const keyword = `%${search.trim()}%`
      params.push(keyword, keyword)
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`
      query += whereClause
      countQuery += whereClause
    }

    query += ' ORDER BY dr.submit_date DESC'
    const queryParams = [...params]

    if (page !== undefined && limit !== undefined) {
      const normalizedPage = Math.max(1, page)
      const normalizedLimit = Math.min(Math.max(1, limit), 100)
      const offset = (normalizedPage - 1) * normalizedLimit
      query += ` LIMIT ${normalizedLimit} OFFSET ${offset}`
    }

    const [rows] = await pool.execute<DailyReportRow[]>(query, queryParams)
    const [countRows] = await pool.execute<CountRow[]>(countQuery, params)

    return {
      data: rows,
      total: countRows[0]?.total || 0
    }
  }

  async findByUserId(
    userId: number,
    startDate?: Date,
    endDate?: Date,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{ data: DailyReport[]; total: number }> {
    let query = `
      SELECT dr.*, u.real_name as user_name
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      WHERE dr.user_id = ?`
    let countQuery = `
      SELECT COUNT(*) as total
      FROM daily_reports dr
      WHERE dr.user_id = ?`
    const params: (string | number)[] = [userId]

    if (startDate && endDate) {
      query += ' AND dr.submit_date BETWEEN ? AND ?'
      countQuery += ' AND dr.submit_date BETWEEN ? AND ?'
      params.push(this.formatDateOnly(startDate), this.formatDateOnly(endDate))
    }

    if (search?.trim()) {
      query += ' AND dr.content LIKE ?'
      countQuery += ' AND dr.content LIKE ?'
      params.push(`%${search.trim()}%`)
    }

    query += ' ORDER BY dr.submit_date DESC'
    const queryParams = [...params]

    if (page !== undefined && limit !== undefined) {
      const normalizedPage = Math.max(1, page)
      const normalizedLimit = Math.min(Math.max(1, limit), 100)
      const offset = (normalizedPage - 1) * normalizedLimit
      query += ` LIMIT ${normalizedLimit} OFFSET ${offset}`
    }

    const [rows] = await pool.execute<DailyReportRow[]>(query, queryParams)
    const [countRows] = await pool.execute<CountRow[]>(countQuery, params)

    return {
      data: rows,
      total: countRows[0]?.total || 0
    }
  }

  async findById(id: number): Promise<DailyReport | null> {
    const [rows] = await pool.execute<DailyReportRow[]>(
      `SELECT dr.*, u.real_name as user_name
       FROM daily_reports dr
       LEFT JOIN users u ON dr.user_id = u.id
       WHERE dr.id = ?`,
      [id]
    )

    return rows[0] || null
  }

  async update(id: number, content: string): Promise<DailyReport | null> {
    await pool.execute(
      'UPDATE daily_reports SET content = ? WHERE id = ?',
      [content, id]
    )

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM daily_reports WHERE id = ?',
      [id]
    )

    return result.affectedRows > 0
  }

  async findByDate(date: string): Promise<DailyReport[]> {
    const [rows] = await pool.execute<DailyReportRow[]>(
      `SELECT dr.*, u.real_name as user_name
       FROM daily_reports dr
       LEFT JOIN users u ON dr.user_id = u.id
       WHERE dr.submit_date = ?
       ORDER BY dr.created_at DESC`,
      [date]
    )

    return rows
  }

  async findByUserIdAndDate(userId: number, date: string): Promise<DailyReport | null> {
    const [rows] = await pool.execute<DailyReportRow[]>(
      `SELECT dr.*, u.real_name as user_name
       FROM daily_reports dr
       LEFT JOIN users u ON dr.user_id = u.id
       WHERE dr.user_id = ? AND dr.submit_date = ?
       ORDER BY dr.created_at DESC
       LIMIT 1`,
      [userId, date]
    )

    return rows[0] || null
  }

  async markAsReviewed(id: number): Promise<void> {
    await pool.execute(
      'UPDATE daily_reports SET reviewed_at = NOW() WHERE id = ? AND reviewed_at IS NULL',
      [id]
    )
  }
}

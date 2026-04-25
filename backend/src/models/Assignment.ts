import pool from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export interface Assignment {
  id: number
  title: string
  description?: string
  deadline: Date
  file_url?: string | null
  created_by: number
  created_at: Date
  updated_at: Date
  created_by_name?: string
}

interface AssignmentRow extends RowDataPacket, Assignment {}

interface CountRow extends RowDataPacket {
  total: number
}

export class AssignmentModel {
  async create(assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO assignments (title, description, deadline, file_url, created_by) VALUES (?, ?, ?, ?, ?)',
      [assignmentData.title, assignmentData.description ?? null, assignmentData.deadline, assignmentData.file_url ?? null, assignmentData.created_by]
    )

    const [rows] = await pool.execute<AssignmentRow[]>(
      'SELECT a.*, u.real_name as created_by_name FROM assignments a LEFT JOIN users u ON a.created_by = u.id WHERE a.id = ?',
      [result.insertId]
    )

    return rows[0]
  }

  async findAll(page?: number, limit?: number, search?: string): Promise<{ data: Assignment[]; total: number }> {
    const normalizedPage = page && page > 0 ? page : undefined
    const normalizedLimit = limit && limit > 0 ? Math.min(limit, 100) : undefined
    const normalizedSearch = search?.trim()
    const whereClause = normalizedSearch ? ' WHERE a.title LIKE ? OR a.description LIKE ?' : ''
    const whereParams: Array<string | number> = normalizedSearch ? [`%${normalizedSearch}%`, `%${normalizedSearch}%`] : []

    try {
      const [countResult] = await pool.execute<CountRow[]>(
        `SELECT COUNT(*) as total
         FROM assignments a${whereClause}`,
        whereParams
      )
      const total = countResult?.[0]?.total || 0

      let query = `
        SELECT a.*, u.real_name as created_by_name,
          (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count,
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students
        FROM assignments a
        LEFT JOIN users u ON a.created_by = u.id
        ${whereClause}
        ORDER BY a.created_at DESC
      `
      const queryParams: Array<string | number> = [...whereParams]

      if (normalizedPage !== undefined && normalizedLimit !== undefined) {
        const offset = (normalizedPage - 1) * normalizedLimit
        query += ` LIMIT ${normalizedLimit} OFFSET ${offset}`
      }

      const [rows] = await pool.execute<AssignmentRow[]>(query, queryParams)

      return {
        data: rows || [],
        total: total
      }
    } catch (error) {
      console.error('findAll error:', error)
      return { data: [], total: 0 }
    }
  }

  async findById(id: number): Promise<Assignment | null> {
    const [rows] = await pool.execute<AssignmentRow[]>(
      'SELECT a.*, u.real_name as created_by_name FROM assignments a LEFT JOIN users u ON a.created_by = u.id WHERE a.id = ?',
      [id]
    )

    return rows[0] || null
  }

  async update(id: number, assignmentData: Partial<Assignment>): Promise<Assignment | null> {
    const fields = []
    const values: (string | number | Date | null)[] = []

    if (assignmentData.title) {
      fields.push('title = ?')
      values.push(assignmentData.title)
    }
    if (assignmentData.description !== undefined) {
      fields.push('description = ?')
      values.push(assignmentData.description ?? null)
    }
    if (assignmentData.deadline) {
      fields.push('deadline = ?')
      values.push(assignmentData.deadline)
    }
    if (assignmentData.file_url !== undefined) {
      fields.push('file_url = ?')
      values.push(assignmentData.file_url ?? null)
    }

    if (fields.length > 0) {
      values.push(id)
      await pool.execute(
        `UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`,
        values
      )
    }

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM assignments WHERE id = ?',
      [id]
    )

    return result.affectedRows > 0
  }
}

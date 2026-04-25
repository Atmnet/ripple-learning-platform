import pool from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export interface AssignmentSubmission {
  id: number
  assignment_id: number
  user_id: number
  file_url?: string
  comment?: string
  grade?: number | null
  feedback?: string | null
  submitted_at: Date
  graded_at?: Date | null
  graded_by?: number | null
  // 关联字段
  student_name?: string
  assignment_title?: string
  student_username?: string
  grader_name?: string
  deadline?: Date
}

interface AssignmentSubmissionRow extends RowDataPacket, AssignmentSubmission {}

export class AssignmentSubmissionModel {
  async create(submissionData: Omit<AssignmentSubmission, 'id' | 'submitted_at'>): Promise<AssignmentSubmission> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO assignment_submissions (assignment_id, user_id, file_url, comment) VALUES (?, ?, ?, ?)',
      [submissionData.assignment_id, submissionData.user_id, submissionData.file_url ?? null, submissionData.comment ?? null]
    )

    const [rows] = await pool.execute<AssignmentSubmissionRow[]>(
      `SELECT s.*, a.title as assignment_title, u.real_name as student_name
       FROM assignment_submissions s
       LEFT JOIN assignments a ON s.assignment_id = a.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [result.insertId]
    )

    return rows[0]
  }

  async findAll(): Promise<AssignmentSubmission[]> {
    const [rows] = await pool.execute<AssignmentSubmissionRow[]>(
      `SELECT s.*, a.title as assignment_title, u.real_name as student_name
       FROM assignment_submissions s
       LEFT JOIN assignments a ON s.assignment_id = a.id
       LEFT JOIN users u ON s.user_id = u.id
       ORDER BY s.submitted_at DESC`
    )

    return rows
  }

  async findById(id: number): Promise<AssignmentSubmission | null> {
    const [rows] = await pool.execute<AssignmentSubmissionRow[]>(
      `SELECT s.*, a.title as assignment_title, u.real_name as student_name
       FROM assignment_submissions s
       LEFT JOIN assignments a ON s.assignment_id = a.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [id]
    )

    return rows[0] || null
  }

  async findByUserAndAssignment(userId: number, assignmentId: number): Promise<AssignmentSubmission | null> {
    const [rows] = await pool.execute<AssignmentSubmissionRow[]>(
      'SELECT * FROM assignment_submissions WHERE user_id = ? AND assignment_id = ?',
      [userId, assignmentId]
    )

    return rows[0] || null
  }

  async findByUserId(userId: number): Promise<AssignmentSubmission[]> {
    const [rows] = await pool.execute<AssignmentSubmissionRow[]>(
      `SELECT s.*, a.title as assignment_title, a.deadline
       FROM assignment_submissions s
       LEFT JOIN assignments a ON s.assignment_id = a.id
       WHERE s.user_id = ?
       ORDER BY s.submitted_at DESC`,
      [userId]
    )

    return rows
  }

  async findByAssignmentId(assignmentId: number): Promise<AssignmentSubmission[]> {
    const [rows] = await pool.execute<AssignmentSubmissionRow[]>(
      `SELECT s.*, a.title as assignment_title, u.real_name as student_name,
              u.username as student_username
       FROM assignment_submissions s
       LEFT JOIN assignments a ON s.assignment_id = a.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.assignment_id = ?
       ORDER BY s.submitted_at DESC`,
      [assignmentId]
    )

    return rows
  }

  async updateGrade(id: number, grade: number, feedback?: string, gradedBy?: number): Promise<AssignmentSubmission | null> {
    try {
      // 尝试使用带 graded_by 的更新（新表结构）
      await pool.execute(
        'UPDATE assignment_submissions SET grade = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP, graded_by = ? WHERE id = ?',
        [grade, feedback ?? null, gradedBy ?? null, id]
      )
    } catch (error) {
      // 如果失败，使用旧表结构更新（不含 graded_by）
      await pool.execute(
        'UPDATE assignment_submissions SET grade = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP WHERE id = ?',
        [grade, feedback ?? null, id]
      )
    }

    return this.findById(id)
  }

  async updateSubmission(id: number, data: Partial<AssignmentSubmission>): Promise<AssignmentSubmission | null> {
    const fields: string[] = []
    const values: (string | number | Date | null | undefined)[] = []

    if (data.file_url !== undefined) {
      fields.push('file_url = ?')
      values.push(data.file_url ?? null)
    }
    if (data.comment !== undefined) {
      fields.push('comment = ?')
      values.push(data.comment ?? null)
    }
    if ('grade' in data) {
      fields.push('grade = ?')
      values.push(data.grade ?? null)
    }
    if ('feedback' in data) {
      fields.push('feedback = ?')
      values.push(data.feedback ?? null)
    }
    if ('graded_at' in data) {
      fields.push('graded_at = ?')
      values.push(data.graded_at ?? null)
    }
    if ('graded_by' in data) {
      fields.push('graded_by = ?')
      values.push(data.graded_by ?? null)
    }

    if (fields.length > 0) {
      fields.push('submitted_at = CURRENT_TIMESTAMP')
      values.push(id)
      // 过滤掉 undefined 值，确保类型正确
      const cleanValues = values.map(v => v === undefined ? null : v)
      await pool.execute(
        `UPDATE assignment_submissions SET ${fields.join(', ')} WHERE id = ?`,
        cleanValues
      )
    }

    return this.findById(id)
  }
}

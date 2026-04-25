import pool from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export interface User {
  id: number
  username: string
  password: string
  real_name: string
  role: 'student' | 'admin'
  created_at: Date
  updated_at: Date
}

export interface UserListResult {
  data: User[]
  total: number
}

interface UserRow extends RowDataPacket, Omit<User, 'role'> {
  role: 'student' | 'admin'
}

export class UserModel {
  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (username, password, real_name, role) VALUES (?, ?, ?, ?)',
      [userData.username, userData.password, userData.real_name, userData.role]
    )

    const [rows] = await pool.execute<UserRow[]>(
      'SELECT id, username, real_name, role, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    )

    return rows[0] as User
  }

  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )

    return (rows[0] as User) || null
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<UserRow[]>(
      'SELECT id, username, real_name, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    )

    return (rows[0] as User) || null
  }

  async findAll(): Promise<User[]> {
    const [rows] = await pool.execute<UserRow[]>(
      'SELECT id, username, real_name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    )

    return rows as User[]
  }

  async findAllPaginated(page = 1, limit = 10, search = ''): Promise<UserListResult> {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10
    const offset = (safePage - 1) * safeLimit
    const keyword = `%${search.trim()}%`
    const hasSearch = search.trim().length > 0
    const whereClause = hasSearch ? 'WHERE username LIKE ? OR real_name LIKE ?' : ''
    const whereParams = hasSearch ? [keyword, keyword] : []

    const [rows] = await pool.execute<UserRow[]>(
      `SELECT id, username, real_name, role, created_at, updated_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${safeLimit} OFFSET ${offset}`,
      whereParams
    )

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM users
       ${whereClause}`,
      whereParams
    )

    return {
      data: rows as User[],
      total: Number(countRows[0]?.total || 0),
    }
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const fields: string[] = []
    const values: (string | number)[] = []

    if (userData.real_name) {
      fields.push('real_name = ?')
      values.push(userData.real_name)
    }
    if (userData.role) {
      fields.push('role = ?')
      values.push(userData.role)
    }

    if (fields.length > 0) {
      values.push(id)
      await pool.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      )
    }

    return this.findById(id)
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [password, id]
    )
  }

  async delete(id: number): Promise<void> {
    await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    )
  }
}

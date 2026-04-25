import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { runMigrations } from '../database/migrate'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'ripple_learning_platform',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '100', 10),
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
})

async function ensureAdminUser(): Promise<void> {
  const connection = await pool.getConnection()

  try {
    const [rows] = (await connection.execute(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      ['admin']
    )) as any[]

    if (rows.length === 0) {
      await connection.execute(
        'INSERT INTO users (username, password, real_name, role) VALUES (?, ?, ?, ?)',
        [
          'admin',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          '管理员',
          'admin',
        ]
      )
    }
  } finally {
    connection.release()
  }
}

export const initDatabase = async () => {
  try {
    await runMigrations(pool)
    await ensureAdminUser()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection()
    await connection.query('SELECT 1')
    connection.release()
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

export default pool

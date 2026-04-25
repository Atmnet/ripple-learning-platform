import fs from 'fs'
import path from 'path'
import type { Pool } from 'mysql2/promise'

const migrationsDir = path.join(__dirname, 'migrations')

function isIgnorableMigrationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code = 'code' in error ? String(error.code) : ''
  return ['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_MULTIPLE_PRI_KEY', 'ER_CANT_DROP_FIELD_OR_KEY'].includes(code)
}

function splitStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false

  for (const char of sql) {
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
    }

    if (char === ';' && !inSingleQuote && !inDoubleQuote) {
      const statement = current.trim()
      if (statement) {
        statements.push(statement)
      }
      current = ''
      continue
    }

    current += char
  }

  const tail = current.trim()
  if (tail) {
    statements.push(tail)
  }

  return statements
}

export async function runMigrations(pool: Pool): Promise<void> {
  const connection = await pool.getConnection()

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        version VARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const [rows] = await connection.query('SELECT version FROM schema_migrations ORDER BY version ASC') as any[]
    const appliedVersions = new Set<string>(rows.map((row: { version: string }) => row.version))

    if (!fs.existsSync(migrationsDir)) {
      return
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((left, right) => left.localeCompare(right))

    for (const file of files) {
      if (appliedVersions.has(file)) {
        continue
      }

      const rawSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      const statements = splitStatements(rawSql)

      await connection.beginTransaction()
      try {
        for (const statement of statements) {
          try {
            await connection.query(statement)
          } catch (error) {
            if (isIgnorableMigrationError(error)) {
              continue
            }
            throw error
          }
        }

        await connection.execute(
          'INSERT INTO schema_migrations (version) VALUES (?)',
          [file]
        )
        await connection.commit()
        console.log(`Applied migration: ${file}`)
      } catch (error) {
        await connection.rollback()
        throw error
      }
    }
  } finally {
    connection.release()
  }
}

import dotenv from 'dotenv'
import { createApp } from './app/server'
import { initDatabase } from './config/database'

dotenv.config()

const app = createApp()
const PORT = process.env.PORT || 3001
const DB_CONNECT_RETRIES = parseInt(process.env.DB_CONNECT_RETRIES || '30', 10)
const DB_CONNECT_DELAY_MS = parseInt(process.env.DB_CONNECT_DELAY_MS || '2000', 10)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const initializeDatabaseWithRetry = async () => {
  let lastError: unknown

  for (let attempt = 1; attempt <= DB_CONNECT_RETRIES; attempt += 1) {
    try {
      await initDatabase()
      console.log('Database connected successfully')
      return
    } catch (error) {
      lastError = error
      console.error(
        `Database startup attempt ${attempt}/${DB_CONNECT_RETRIES} failed. Retrying in ${DB_CONNECT_DELAY_MS}ms...`,
        error
      )

      if (attempt < DB_CONNECT_RETRIES) {
        await sleep(DB_CONNECT_DELAY_MS)
      }
    }
  }

  throw lastError
}

const startServer = async () => {
  try {
    await initializeDatabaseWithRetry()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

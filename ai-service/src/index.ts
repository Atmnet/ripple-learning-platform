import dotenv from 'dotenv'
import { createServer } from './app/server'
import { checkDatabaseConnection } from './config/database'

dotenv.config()

const port = parseInt(process.env.PORT || '3002', 10)
const app = createServer()
const DB_CONNECT_RETRIES = parseInt(process.env.DB_CONNECT_RETRIES || '30', 10)
const DB_CONNECT_DELAY_MS = parseInt(process.env.DB_CONNECT_DELAY_MS || '2000', 10)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForDatabase() {
  for (let attempt = 1; attempt <= DB_CONNECT_RETRIES; attempt += 1) {
    const databaseReady = await checkDatabaseConnection()
    if (databaseReady) {
      console.log('AI service database connected successfully')
      return
    }

    console.error(
      `AI service database startup attempt ${attempt}/${DB_CONNECT_RETRIES} failed. Retrying in ${DB_CONNECT_DELAY_MS}ms...`
    )

    if (attempt < DB_CONNECT_RETRIES) {
      await sleep(DB_CONNECT_DELAY_MS)
    }
  }

  throw new Error('Failed to connect to database')
}

async function start() {
  await waitForDatabase()

  app.listen(port, () => {
    console.log(`AI service running on port ${port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start AI service', error)
  process.exit(1)
})

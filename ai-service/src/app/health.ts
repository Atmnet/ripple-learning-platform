import { checkDatabaseConnection } from '../config/database'

export async function getHealthSnapshot() {
  const database = await checkDatabaseConnection()

  return {
    ready: database,
    database: {
      status: database ? 'UP' : 'DOWN',
    },
  }
}

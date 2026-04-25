import { checkDatabaseConnection } from '../config/database'
import { getRedisStatus } from '../shared/cache/redis'

export async function getHealthSnapshot() {
  const database = await checkDatabaseConnection()
  const redis = await getRedisStatus()

  return {
    database: database ? 'up' : 'down',
    redis,
    ready: database && redis !== 'down',
  }
}

import { createClient } from 'redis'

type AppRedisClient = ReturnType<typeof createClient>

let redisClient: AppRedisClient | null = null
let redisConnectPromise: Promise<AppRedisClient | null> | null = null

export async function getRedisClient(): Promise<AppRedisClient | null> {
  if (!process.env.REDIS_URL) {
    return null
  }

  if (redisClient?.isOpen) {
    return redisClient
  }

  if (redisConnectPromise) {
    return redisConnectPromise
  }

  redisConnectPromise = (async () => {
    try {
      const client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS || '5000', 10),
        },
      })

      client.on('error', (error) => {
        console.error('Redis client error:', error)
      })

      await client.connect()
      redisClient = client
      return client
    } catch (error) {
      console.error('Redis connect failed:', error)
      redisClient = null
      return null
    } finally {
      redisConnectPromise = null
    }
  })()

  return redisConnectPromise
}

export async function getRedisStatus(): Promise<'disabled' | 'up' | 'down'> {
  if (!process.env.REDIS_URL) {
    return 'disabled'
  }

  try {
    const client = await getRedisClient()
    if (!client) {
      return 'down'
    }

    await client.ping()
    return 'up'
  } catch {
    return 'down'
  }
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit()
  }
  redisClient = null
}

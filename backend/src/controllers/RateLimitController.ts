import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'

interface RateLimitConfig {
  windowMs: number
  max: number
  enabled: boolean
}

let rateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 100,
  enabled: true,
}

const dynamicRateLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !rateLimitConfig.enabled,
  limit: () => rateLimitConfig.max,
})

export const getRateLimitConfig = (_req: Request, res: Response) => {
  res.json({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    enabled: rateLimitConfig.enabled,
    windowMinutes: rateLimitConfig.windowMs / 60000,
  })
}

export const updateRateLimitConfig = (req: Request, res: Response) => {
  const { max, windowMinutes, enabled } = req.body

  if (max !== undefined) {
    const maxRequests = parseInt(max, 10)
    if (![100, 200, 500].includes(maxRequests)) {
      return res.status(400).json({ error: '限流次数必须是 100、200 或 500' })
    }
    rateLimitConfig.max = maxRequests
  }

  if (windowMinutes !== undefined) {
    const minutes = parseInt(windowMinutes, 10)
    if (minutes < 1 || minutes > 60) {
      return res.status(400).json({ error: '时间窗口必须在 1-60 分钟之间' })
    }
    rateLimitConfig.windowMs = minutes * 60 * 1000
  }

  if (enabled !== undefined) {
    rateLimitConfig.enabled = Boolean(enabled)
  }

  res.json({
    message: '限流配置已更新，将对后续请求立即生效',
    config: {
      windowMs: rateLimitConfig.windowMs,
      max: rateLimitConfig.max,
      enabled: rateLimitConfig.enabled,
      windowMinutes: rateLimitConfig.windowMs / 60000,
    },
  })
}

export const getRateLimitMiddlewareConfig = () => ({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  enabled: rateLimitConfig.enabled,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const createDynamicRateLimiter = () => dynamicRateLimiter

export const resetRateLimitConfig = (_req: Request, res: Response) => {
  rateLimitConfig = {
    windowMs: 60 * 1000,
    max: 100,
    enabled: true,
  }

  res.json({
    message: '限流配置已重置为默认值',
    config: {
      windowMs: rateLimitConfig.windowMs,
      max: rateLimitConfig.max,
      enabled: rateLimitConfig.enabled,
      windowMinutes: 1,
    },
  })
}

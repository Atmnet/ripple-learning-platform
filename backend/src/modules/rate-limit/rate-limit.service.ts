import { NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { RateLimitRepository } from './rate-limit.repository'

const rateLimitRepository = new RateLimitRepository()

export class RateLimitService {
  private middleware = this.buildMiddleware()

  private buildMiddleware() {
    const config = rateLimitRepository.getConfig()

    return rateLimit({
      windowMs: config.windowMs,
      limit: config.max,
      message: { error: '请求过于频繁，请稍后再试' },
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => !rateLimitRepository.getConfig().enabled,
    })
  }

  private refreshMiddleware() {
    this.middleware = this.buildMiddleware()
  }

  getConfig() {
    const config = rateLimitRepository.getConfig()
    return { ...config, windowMinutes: config.windowMs / 60000 }
  }

  updateConfig(max: unknown, windowMinutes: unknown, enabled: unknown) {
    const updates: { max?: number; windowMs?: number; enabled?: boolean } = {}

    if (max !== undefined) {
      const maxRequests = parseInt(String(max), 10)
      if (![100, 200, 500, 1000].includes(maxRequests)) {
        throw new AppError('限流次数必须是 100、200、500 或 1000', 400, ERROR_CODES.BAD_REQUEST)
      }
      updates.max = maxRequests
    }

    if (windowMinutes !== undefined) {
      const minutes = parseInt(String(windowMinutes), 10)
      if (minutes < 1 || minutes > 60) {
        throw new AppError('时间窗口必须在 1-60 分钟之间', 400, ERROR_CODES.BAD_REQUEST)
      }
      updates.windowMs = minutes * 60 * 1000
    }

    if (enabled !== undefined) {
      updates.enabled = Boolean(enabled)
    }

    const config = rateLimitRepository.updateConfig(updates)
    this.refreshMiddleware()
    return { ...config, windowMinutes: config.windowMs / 60000 }
  }

  resetConfig() {
    const config = rateLimitRepository.resetConfig()
    this.refreshMiddleware()
    return { ...config, windowMinutes: config.windowMs / 60000 }
  }

  createMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => this.middleware(req, res, next)
  }
}

export const rateLimitService = new RateLimitService()

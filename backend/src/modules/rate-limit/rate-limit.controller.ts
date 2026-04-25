import { Request, Response } from 'express'
import { sendError } from '../../shared/utils/response'
import { rateLimitService } from './rate-limit.service'

export const getRateLimitConfig = (_req: Request, res: Response) => {
  res.json(rateLimitService.getConfig())
}

export const updateRateLimitConfig = (req: Request, res: Response) => {
  try {
    const config = rateLimitService.updateConfig(req.body.max, req.body.windowMinutes, req.body.enabled)
    res.json({
      message: '限流配置已更新，并已立即生效',
      config,
    })
  } catch (error) {
    sendError(res, error)
  }
}

export const resetRateLimitConfig = (_req: Request, res: Response) => {
  const config = rateLimitService.resetConfig()
  res.json({
    message: '限流配置已重置为默认值',
    config,
  })
}

export const createDynamicRateLimiter = () => rateLimitService.createMiddleware()

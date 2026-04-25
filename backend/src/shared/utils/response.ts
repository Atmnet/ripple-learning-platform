import { Response } from 'express'
import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'

interface SuccessMeta {
  total?: number
  page?: number
  limit?: number
  [key: string]: unknown
}

export function sendSuccess<T>(res: Response, data: T, meta?: SuccessMeta, statusCode = 200): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta || {}),
  })
}

export function sendMessage(res: Response, message: string, statusCode = 200, extra?: Record<string, unknown>): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(extra || {}),
  })
}

export function sendError(res: Response, error: unknown, fallbackMessage = 'Internal server error'): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      ...(error.details && typeof error.details === 'object' ? { details: error.details } : {}),
    })
  }

  return res.status(500).json({
    success: false,
    error: fallbackMessage,
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
  })
}

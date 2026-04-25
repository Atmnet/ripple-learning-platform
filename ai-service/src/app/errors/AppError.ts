import { ERROR_CODES, type ErrorCode } from './error-codes'

export class AppError extends Error {
  statusCode: number
  code: ErrorCode
  details?: unknown

  constructor(message: string, statusCode = 500, code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

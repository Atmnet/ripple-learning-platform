import { AuthRequest } from '../../middleware/auth'

export type AuthUser = NonNullable<AuthRequest['user']>

export interface DailyReportQuery {
  start?: unknown
  end?: unknown
  page?: unknown
  limit?: unknown
  search?: unknown
}

export interface DailyReportCommentPayload {
  content: string
}

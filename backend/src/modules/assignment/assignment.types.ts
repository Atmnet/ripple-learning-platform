import { AuthRequest } from '../../middleware/auth'

export type AuthUser = NonNullable<AuthRequest['user']>

export interface CreateAssignmentPayload {
  title: string
  description?: string
  deadline: string
  file_url?: unknown
  file_urls?: unknown
}

export interface SubmitAssignmentPayload {
  file_url?: unknown
  file_urls?: unknown
  comment?: string
}

export interface AssignmentDownloadTarget {
  fileUrl: string
  downloadFileName: string
  contentType: string
  localPath?: string
}

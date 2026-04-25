export type DailyReportTagType = 'success' | 'warning' | 'info' | 'danger'

export interface DailyReportStatusInput {
  hasSubmitted?: boolean
  unreadComments?: number | null
  unread_comments?: number | null
  isReviewed?: boolean | null
  is_reviewed?: boolean | null
  reviewed_at?: string | null
}

export interface DailyReportStatus {
  hasSubmitted: boolean
  unreadComments: number
  isReviewed: boolean
  primaryType: DailyReportTagType
  primaryText: string
  feedbackType: DailyReportTagType
  feedbackText: string
  description: string
}

export const getDailyReportStatus = (input: DailyReportStatusInput): DailyReportStatus => {
  const hasSubmitted = Boolean(input.hasSubmitted)
  const unreadComments = Number(input.unreadComments ?? input.unread_comments ?? 0)
  const isReviewed = Boolean(input.isReviewed ?? input.is_reviewed ?? input.reviewed_at)

  if (!hasSubmitted) {
    return {
      hasSubmitted,
      unreadComments: 0,
      isReviewed: false,
      primaryType: 'warning',
      primaryText: '未提交',
      feedbackType: 'info',
      feedbackText: '未阅',
      description: '点击提交今日日报'
    }
  }

  if (unreadComments > 0) {
    return {
      hasSubmitted,
      unreadComments,
      isReviewed,
      primaryType: 'success',
      primaryText: '已提交',
      feedbackType: 'warning',
      feedbackText: '新评论',
      description: '老师有新反馈，点击查看'
    }
  }

  if (isReviewed) {
    return {
      hasSubmitted,
      unreadComments,
      isReviewed,
      primaryType: 'success',
      primaryText: '已提交',
      feedbackType: 'success',
      feedbackText: '老师已阅',
      description: '老师已查看你的日报'
    }
  }

  return {
    hasSubmitted,
    unreadComments,
    isReviewed,
    primaryType: 'success',
    primaryText: '已提交',
    feedbackType: 'info',
    feedbackText: '未阅',
    description: '今日日报已完成'
  }
}

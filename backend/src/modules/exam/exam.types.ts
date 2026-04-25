import { AuthRequest } from '../../middleware/auth'

export type AuthUser = NonNullable<AuthRequest['user']>

export interface ExamQuestionBankFilters {
  category?: string
  type?: string
}

export interface CreateExamPayload {
  title: string
  description?: string
  questionIds: number[]
  categories?: string[]
  assignedStudentIds?: number[]
  isRandom?: boolean
  startTime: string
  endTime: string
  duration?: number
  passingScore?: number
}

export interface UpdateExamPayload extends Partial<CreateExamPayload> {
  status?: 'draft' | 'published' | 'ended'
}

export interface SubmitExamAnswerPayload {
  questionId: number
  answer: string | number | boolean | null | undefined
}

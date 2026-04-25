import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { MockInterviewRepository } from './mock-interview.repository'

const mockInterviewRepository = new MockInterviewRepository()

export class MockInterviewService {
  getCategories() {
    return mockInterviewRepository.getCategories()
  }

  getQuestions() {
    return mockInterviewRepository.getQuestions()
  }

  startInterview(userId: number, userName: string, category = 'linux', count = 5) {
    return mockInterviewRepository.createSession(userId, userName, category, Number(count) || 5)
  }

  getSession(sessionId: string, userId: number) {
    const session = mockInterviewRepository.getSession(sessionId, userId)
    if (!session) {
      throw new AppError('模拟面试会话不存在', 404, ERROR_CODES.NOT_FOUND)
    }
    return session
  }

  submitInterview(sessionId: string, userId: number, answers: unknown) {
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new AppError('请先提交回答内容', 400, ERROR_CODES.BAD_REQUEST)
    }

    const report = mockInterviewRepository.submitSession(
      sessionId,
      userId,
      answers.map((item: any) => ({
        questionId: Number(item.questionId),
        answer: String(item.answer || ''),
      }))
    )

    if (!report) {
      throw new AppError('模拟面试会话不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    return report
  }

  getMyReports(userId: number) {
    return mockInterviewRepository.getUserReports(userId)
  }

  getReportDetail(reportId: string, userId: number, role: string) {
    const report = mockInterviewRepository.getReport(reportId)
    if (!report) {
      throw new AppError('模拟面试报告不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    if (role !== 'admin' && report.userId !== userId) {
      throw new AppError('无权查看该报告', 403, ERROR_CODES.FORBIDDEN)
    }

    return report
  }

  getAllReports() {
    return mockInterviewRepository.getAllReports()
  }
}

export const mockInterviewService = new MockInterviewService()

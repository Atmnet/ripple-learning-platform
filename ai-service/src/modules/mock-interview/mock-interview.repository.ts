import {
  createInterviewSession,
  getAllInterviewReports,
  getInterviewCategories,
  getInterviewQuestions,
  getInterviewReport,
  getInterviewSession,
  getUserInterviewReports,
  submitInterviewSession,
} from '../../models/mockInterview'

export class MockInterviewRepository {
  getCategories() {
    return getInterviewCategories()
  }

  getQuestions() {
    return getInterviewQuestions()
  }

  createSession(userId: number, userName: string, category: string, count: number) {
    return createInterviewSession(userId, userName, category, count)
  }

  getSession(sessionId: string, userId: number) {
    return getInterviewSession(sessionId, userId)
  }

  submitSession(sessionId: string, userId: number, answers: Array<{ questionId: number; answer: string }>) {
    return submitInterviewSession(sessionId, userId, answers)
  }

  getUserReports(userId: number) {
    return getUserInterviewReports(userId)
  }

  getReport(reportId: string) {
    return getInterviewReport(reportId)
  }

  getAllReports() {
    return getAllInterviewReports()
  }
}

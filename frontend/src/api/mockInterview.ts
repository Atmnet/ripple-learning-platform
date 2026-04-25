import api from './index'

export interface MockInterviewCategory {
  key: string
  name: string
  description: string
}

export interface MockInterviewReport {
  id: string
  sessionId: string
  userId: number
  userName: string
  title: string
  category: string
  score: number
  questionCount: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  createdAt: string
  answers: Array<{
    questionId: number
    question: string
    category: string
    answer: string
    score: number
    matchedPoints: string[]
    missingPoints: string[]
    suggestions: string[]
    summary: string
  }>
}

export function getMockInterviewCategories() {
  return api.get('/mock-interview/categories')
}

export function startMockInterview(payload: { category: string; count: number }) {
  return api.post('/mock-interview/sessions', payload)
}

export function submitMockInterview(id: string, answers: Array<{ questionId: number; answer: string }>) {
  return api.post(`/mock-interview/sessions/${id}/submit`, { answers })
}

export function getMyMockInterviewReports() {
  return api.get('/mock-interview/reports')
}

export function getMockInterviewReport(id: string) {
  return api.get(`/mock-interview/reports/${id}`)
}

export function getAdminMockInterviewQuestions() {
  return api.get('/mock-interview/admin/questions')
}

export function getAdminMockInterviewReports() {
  return api.get('/mock-interview/admin/reports')
}

import { getAllQuestions } from '../../models/linux/LinuxQuiz'
import {
  type Exam,
  type ExamData,
  createExam,
  updateExam,
  deleteExam,
  getExamById,
  getAllExams,
  getPublishedExams,
  publishExam,
  endExam,
  parseExamDateTime,
} from '../../models/linux/Exam'
import {
  type StudentExam,
  type StudentAnswer,
  startExam,
  submitAnswer,
  completeExam,
  getStudentExam,
  getStudentExams,
  getExamResults,
  hasCompletedExam,
  getWrongAnswers,
} from '../../models/linux/StudentExam'

export class ExamRepository {
  getAllQuestions() {
    return getAllQuestions()
  }

  createExam(data: ExamData) {
    return createExam(data)
  }

  updateExam(id: number, data: Partial<ExamData>) {
    return updateExam(id, data)
  }

  deleteExam(id: number) {
    return deleteExam(id)
  }

  getExamById(id: number): Promise<Exam | null> {
    return getExamById(id)
  }

  getAllExams(page?: number, limit?: number) {
    return getAllExams(page, limit)
  }

  getPublishedExams() {
    return getPublishedExams()
  }

  publishExam(id: number) {
    return publishExam(id)
  }

  endExam(id: number) {
    return endExam(id)
  }

  parseExamDateTime(value: string | Date) {
    return parseExamDateTime(value)
  }

  startExam(examId: number, studentId: number): Promise<StudentExam | null> {
    return startExam(examId, studentId)
  }

  submitAnswer(studentExamId: number, questionId: number, answer: string | number | boolean | null, isCorrect: boolean, correctAnswer: string | number | boolean | string[]) {
    return submitAnswer(studentExamId, questionId, answer, isCorrect, correctAnswer)
  }

  completeExam(studentExamId: number, score: number, correctCount: number, wrongCount: number) {
    return completeExam(studentExamId, score, correctCount, wrongCount)
  }

  getStudentExam(id: number): Promise<StudentExam | null> {
    return getStudentExam(id)
  }

  getStudentExams(studentId: number): Promise<StudentExam[]> {
    return getStudentExams(studentId)
  }

  getExamResults(examId: number): Promise<{ data: StudentExam[]; stats: { total: number; completed: number; averageScore: number } }> {
    return getExamResults(examId)
  }

  hasCompletedExam(examId: number, studentId: number): Promise<boolean> {
    return hasCompletedExam(examId, studentId)
  }

  getWrongAnswers(studentExamId: number): Promise<StudentAnswer[]> {
    return getWrongAnswers(studentExamId)
  }
}

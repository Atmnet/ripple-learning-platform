import { GradesRepository } from './grades.repository'

const gradesRepository = new GradesRepository()

export class GradesService {
  async getAllGrades() {
    const submissions = await gradesRepository.findAll()
    return submissions.map((sub) => ({
      id: sub.id,
      student_id: sub.user_id,
      student_name: sub.student_name || '-',
      assignment_id: sub.assignment_id,
      assignment_title: sub.assignment_title || '-',
      grade: sub.grade,
      feedback: sub.feedback,
      submitted_at: sub.submitted_at,
      graded_at: sub.graded_at,
      status: sub.grade !== null && sub.grade !== undefined ? '已批改' : '未批改',
    }))
  }

  async exportGradesCsv() {
    const submissions = await gradesRepository.findAll()
    const headers = ['学员姓名', '作业标题', '成绩', '反馈', '提交时间', '批改时间', '状态']
    const rows = submissions.map((sub) => [
      sub.student_name || '-',
      sub.assignment_title || '-',
      sub.grade !== null && sub.grade !== undefined ? sub.grade.toString() : '-',
      sub.feedback || '-',
      sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('zh-CN') : '-',
      sub.graded_at ? new Date(sub.graded_at).toLocaleString('zh-CN') : '-',
      sub.grade !== null && sub.grade !== undefined ? '已批改' : '未批改',
    ])
    return ['\uFEFF' + headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')
  }

  async importGrades(grades: Array<{ submission_id: number | string; grade: number | string; feedback?: string }>) {
    let successCount = 0
    let errorCount = 0
    for (const gradeData of grades) {
      try {
        if (!gradeData.submission_id || gradeData.grade === undefined) {
          errorCount++
          continue
        }
        await gradesRepository.updateGrade(parseInt(String(gradeData.submission_id), 10), parseFloat(String(gradeData.grade)), gradeData.feedback, 1)
        successCount++
      } catch {
        errorCount++
      }
    }
    return { successCount, errorCount }
  }
}

export const gradesService = new GradesService()

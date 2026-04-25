import { Request, Response } from 'express'
import { AssignmentSubmissionModel } from '../models/AssignmentSubmission'
import { UserModel } from '../models/User'
import { AssignmentModel } from '../models/Assignment'

const submissionModel = new AssignmentSubmissionModel()
const userModel = new UserModel()
const assignmentModel = new AssignmentModel()

// 获取所有成绩（管理员）
export const getAllGrades = async (req: Request, res: Response) => {
  try {
    const submissions = await submissionModel.findAll()

    // 格式化成绩数据
    const grades = submissions.map(sub => ({
      id: sub.id,
      student_id: sub.user_id,
      student_name: sub.student_name || '-',
      assignment_id: sub.assignment_id,
      assignment_title: sub.assignment_title || '-',
      grade: sub.grade,
      feedback: sub.feedback,
      submitted_at: sub.submitted_at,
      graded_at: sub.graded_at,
      status: sub.grade !== null && sub.grade !== undefined ? '已批改' : '未批改'
    }))

    res.json(grades)
  } catch (error) {
    console.error('Get all grades error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 导出成绩为CSV
export const exportGrades = async (req: Request, res: Response) => {
  try {
    const submissions = await submissionModel.findAll()

    // CSV 表头
    const headers = ['学员姓名', '作业标题', '成绩', '反馈', '提交时间', '批改时间', '状态']

    // CSV 数据行
    const rows = submissions.map(sub => [
      sub.student_name || '-',
      sub.assignment_title || '-',
      sub.grade !== null && sub.grade !== undefined ? sub.grade.toString() : '-',
      sub.feedback || '-',
      sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('zh-CN') : '-',
      sub.graded_at ? new Date(sub.graded_at).toLocaleString('zh-CN') : '-',
      sub.grade !== null && sub.grade !== undefined ? '已批改' : '未批改'
    ])

    // 生成 CSV 内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename=grades_${Date.now()}.csv`)

    // 添加 BOM 以支持中文
    res.send('\uFEFF' + csvContent)
  } catch (error) {
    console.error('Export grades error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 导入成绩
export const importGrades = async (req: Request, res: Response) => {
  try {
    const { grades } = req.body

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ error: 'Invalid grades data' })
    }

    let successCount = 0
    let errorCount = 0

    for (const gradeData of grades) {
      try {
        const { submission_id, grade, feedback } = gradeData

        if (!submission_id || grade === undefined) {
          errorCount++
          continue
        }

        await submissionModel.updateGrade(parseInt(submission_id), parseFloat(grade), feedback, 1) // 系统导入，使用管理员ID 1
        successCount++
      } catch (err) {
        errorCount++
        console.error(`Failed to update grade for submission:`, gradeData, err)
      }
    }

    res.json({
      message: `导入完成: ${successCount} 条成功, ${errorCount} 条失败`,
      success: successCount,
      failed: errorCount
    })
  } catch (error) {
    console.error('Import grades error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

import { Request, Response } from 'express'
import { sendError } from '../../shared/utils/response'
import { gradesService } from './grades.service'

export async function getAllGrades(_req: Request, res: Response): Promise<void> {
  try {
    const grades = await gradesService.getAllGrades()
    res.json(grades)
  } catch (error) {
    console.error('Get all grades error:', error)
    sendError(res, error)
  }
}

export async function exportGrades(_req: Request, res: Response): Promise<void> {
  try {
    const csv = await gradesService.exportGradesCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename=grades_${Date.now()}.csv`)
    res.send(csv)
  } catch (error) {
    console.error('Export grades error:', error)
    sendError(res, error)
  }
}

export async function importGrades(req: Request, res: Response): Promise<void> {
  try {
    if (!Array.isArray(req.body.grades) || req.body.grades.length === 0) {
      res.status(400).json({ error: 'Invalid grades data' })
      return
    }
    const result = await gradesService.importGrades(req.body.grades)
    res.json({
      message: `导入完成: ${result.successCount} 条成功, ${result.errorCount} 条失败`,
      success: result.successCount,
      failed: result.errorCount,
    })
  } catch (error) {
    console.error('Import grades error:', error)
    sendError(res, error)
  }
}

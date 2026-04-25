import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express'
import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { AuthRequest } from '../../middleware/auth'
import { sendError, sendMessage, sendSuccess } from '../../shared/utils/response'
import { assignmentService } from './assignment.service'

export async function createAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await assignmentService.createAssignment(req.body, req.user!)
    sendSuccess(res, assignment, undefined, 201)
  } catch (error) {
    console.error('Create assignment error:', error)
    sendError(res, error)
  }
}

export async function getAssignments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await assignmentService.getAssignments(req.query.page, req.query.limit, req.query.search, req.user)
    res.json(result)
  } catch (error) {
    console.error('Get assignments error:', error)
    sendError(res, error)
  }
}

export async function getAssignmentById(req: Request, res: Response): Promise<void> {
  try {
    const assignment = await assignmentService.getAssignmentById(Number.parseInt(req.params.id, 10))
    res.json(assignment)
  } catch (error) {
    console.error('Get assignment error:', error)
    sendError(res, error)
  }
}

export async function submitAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const submission = await assignmentService.submitAssignment(Number.parseInt(req.params.id, 10), req.body, req.user!)
    sendSuccess(res, submission, undefined, 201)
  } catch (error) {
    console.error('Submit assignment error:', error)
    sendError(res, error)
  }
}

export async function gradeAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const submission = await assignmentService.gradeAssignment(
      Number.parseInt(String(req.body.submissionId), 10),
      req.body.grade,
      req.body.feedback,
      req.user!
    )
    res.json(submission)
  } catch (error) {
    console.error('Grade assignment error:', error)
    sendError(res, error)
  }
}

export async function getSubmissionsByAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const submissions = await assignmentService.getSubmissionsByAssignment(Number.parseInt(req.params.id, 10))
    res.json(submissions)
  } catch (error) {
    console.error('Get submissions by assignment error:', error)
    sendError(res, error)
  }
}

export async function updateAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await assignmentService.updateAssignment(Number.parseInt(req.params.id, 10), req.body)
    res.json(assignment)
  } catch (error) {
    console.error('Update assignment error:', error)
    sendError(res, error)
  }
}

export async function deleteAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    await assignmentService.deleteAssignment(Number.parseInt(req.params.id, 10))
    sendMessage(res, 'Assignment deleted successfully')
  } catch (error) {
    console.error('Delete assignment error:', error)
    sendError(res, error)
  }
}

export async function getMySubmissions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const submissions = await assignmentService.getMySubmissions(req.user!.id)
    res.json(submissions)
  } catch (error) {
    console.error('Get my submissions error:', error)
    sendError(res, error)
  }
}

export async function getAllStudentsSubmissionStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await assignmentService.getAllStudentsSubmissionStatus(Number.parseInt(req.params.id, 10))
    res.json(result)
  } catch (error) {
    console.error('Get all students submission status error:', error)
    sendError(res, error)
  }
}

export async function downloadSubmission(req: AuthRequest, res: Response): Promise<void> {
  try {
    const target = await assignmentService.getDownloadTarget(
      Number.parseInt(req.params.submissionId, 10),
      req.user!,
      req.query.index
    )

    const ext = path.extname(target.fileUrl)
    const encodedFilename = encodeURIComponent(target.downloadFileName)
    const safeFilename = `submission_${req.params.submissionId}${ext}`

    res.setHeader('Content-Type', target.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`)

    if (target.fileUrl.startsWith('http')) {
      const response = await assignmentService.streamRemote(target.fileUrl)
      response.data.pipe(res)
      return
    }

    if (!target.localPath || !fs.existsSync(target.localPath)) {
      sendError(res, new AppError('作业附件不存在或已失效', 404, ERROR_CODES.NOT_FOUND))
      return
    }

    res.sendFile(path.resolve(target.localPath))
  } catch (error) {
    console.error('Download submission error:', error)
    sendError(res, error)
  }
}

import axios from 'axios'
import path from 'path'
import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { AssignmentRepository } from './assignment.repository'
import { AssignmentDownloadTarget, AuthUser, CreateAssignmentPayload, SubmitAssignmentPayload } from './assignment.types'

const assignmentRepository = new AssignmentRepository()

function normalizeFileUrls(fileUrlsInput: unknown, fallbackFileUrl?: unknown): string[] {
  let parsedInput = fileUrlsInput

  if (typeof parsedInput === 'string') {
    try {
      parsedInput = JSON.parse(parsedInput)
    } catch {
      parsedInput = [parsedInput]
    }
  }

  if ((!parsedInput || (Array.isArray(parsedInput) && parsedInput.length === 0)) && fallbackFileUrl) {
    parsedInput = typeof fallbackFileUrl === 'string' ? [fallbackFileUrl] : fallbackFileUrl
  }

  if (!Array.isArray(parsedInput)) {
    return []
  }

  return parsedInput
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getContentType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
  }

  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
}

export class AssignmentService {
  async createAssignment(payload: CreateAssignmentPayload, user: AuthUser) {
    if (!payload.title || !payload.deadline) {
      throw new AppError('Title and deadline are required', 400, ERROR_CODES.BAD_REQUEST)
    }

    const normalizedFileUrls = normalizeFileUrls(payload.file_urls, payload.file_url)
    const assignment = await assignmentRepository.createAssignment({
      title: payload.title,
      description: payload.description,
      deadline: payload.deadline as unknown as Date,
      file_url: normalizedFileUrls.length > 0 ? JSON.stringify(normalizedFileUrls) : null,
      created_by: user.id,
    })

    return assignment
  }

  async getAssignments(pageValue?: unknown, limitValue?: unknown, searchValue?: unknown, user?: AuthUser) {
    const page = typeof pageValue === 'string' ? Number.parseInt(pageValue, 10) : undefined
    const limit = typeof limitValue === 'string' ? Number.parseInt(limitValue, 10) : undefined
    const search = typeof searchValue === 'string' ? searchValue : undefined

    const result = await assignmentRepository.getAssignments(page, limit, search)
    if (user?.role === 'admin') {
      return result
    }

    return {
      ...result,
      data: result.data.map((item) => ({
        ...item,
        submission_count: undefined,
        total_students: undefined,
      })),
    }
  }

  async getAssignmentById(assignmentId: number) {
    const assignment = await assignmentRepository.getAssignmentById(assignmentId)
    if (!assignment) {
      throw new AppError('Assignment not found', 404, ERROR_CODES.ASSIGNMENT_NOT_FOUND)
    }

    return assignment
  }

  async submitAssignment(assignmentId: number, payload: SubmitAssignmentPayload, user: AuthUser) {
    if (user.role !== 'student') {
      throw new AppError('Only students can submit assignments', 403, ERROR_CODES.FORBIDDEN)
    }

    const finalFileUrls = normalizeFileUrls(payload.file_urls, payload.file_url)
    if (finalFileUrls.length === 0) {
      throw new AppError('请上传作业文件', 400, ERROR_CODES.BAD_REQUEST)
    }

    const assignment = await this.getAssignmentById(assignmentId)
    const deadline = new Date(assignment.deadline)
    if (new Date() > deadline) {
      throw new AppError('已超过作业截止日期，无法提交', 400, ERROR_CODES.ASSIGNMENT_DEADLINE_PASSED)
    }

    const existingSubmission = await assignmentRepository.findSubmissionByUserAndAssignment(user.id, assignmentId)
    if (existingSubmission) {
      throw new AppError('该作业已提交，不能重复提交', 409, ERROR_CODES.ASSIGNMENT_ALREADY_SUBMITTED)
    }

    const submission = await assignmentRepository.createSubmission({
      assignment_id: assignmentId,
      user_id: user.id,
      file_url: JSON.stringify(finalFileUrls),
      comment: payload.comment,
    })

    return {
      ...submission,
      is_update: false,
    }
  }

  async gradeAssignment(submissionId: number, grade: number | null | undefined, feedback: string | undefined, user: AuthUser) {
    if (submissionId === undefined || Number.isNaN(submissionId)) {
      throw new AppError('Submission ID is required', 400, ERROR_CODES.BAD_REQUEST)
    }

    if (grade === undefined || grade === null) {
      throw new AppError('Grade is required', 400, ERROR_CODES.BAD_REQUEST)
    }

    const submission = await assignmentRepository.updateGrade(submissionId, grade, feedback, user.id)
    if (!submission) {
      throw new AppError('Submission not found', 404, ERROR_CODES.NOT_FOUND)
    }

    return submission
  }

  getSubmissionsByAssignment(assignmentId: number) {
    return assignmentRepository.findSubmissionsByAssignmentId(assignmentId)
  }

  async updateAssignment(assignmentId: number, payload: CreateAssignmentPayload) {
    const existingAssignment = await assignmentRepository.getAssignmentById(assignmentId)
    if (!existingAssignment) {
      throw new AppError('Assignment not found', 404, ERROR_CODES.ASSIGNMENT_NOT_FOUND)
    }

    const normalizedFileUrls = normalizeFileUrls(payload.file_urls, payload.file_url)
    const updatedAssignment = await assignmentRepository.updateAssignment(assignmentId, {
      title: payload.title,
      description: payload.description,
      deadline: payload.deadline as unknown as Date,
      file_url: normalizedFileUrls.length > 0 ? JSON.stringify(normalizedFileUrls) : null,
    })

    return updatedAssignment
  }

  async deleteAssignment(assignmentId: number) {
    const existingAssignment = await assignmentRepository.getAssignmentById(assignmentId)
    if (!existingAssignment) {
      throw new AppError('Assignment not found', 404, ERROR_CODES.ASSIGNMENT_NOT_FOUND)
    }

    await assignmentRepository.deleteAssignment(assignmentId)
  }

  getMySubmissions(userId: number) {
    return assignmentRepository.findSubmissionsByUserId(userId)
  }

  async getAllStudentsSubmissionStatus(assignmentId: number) {
    const allUsers = await assignmentRepository.findAllUsers()
    const students = allUsers.filter((user) => user.role === 'student')
    const submissions = await assignmentRepository.findSubmissionsByAssignmentId(assignmentId)
    const submittedUserIds = new Set(submissions.map((submission) => submission.user_id))

    const submitted = submissions.map((submission) => {
      const fileUrls = normalizeFileUrls(submission.file_url)
      return {
        id: submission.id,
        assignment_id: submission.assignment_id,
        user_id: submission.user_id,
        file_url: submission.file_url || null,
        file_urls: fileUrls,
        file_count: fileUrls.length,
        comment: submission.comment,
        grade: submission.grade,
        feedback: submission.feedback,
        submitted_at: submission.submitted_at,
        graded_at: submission.graded_at,
        graded_by: submission.graded_by,
        student_name: submission.student_name || '未知',
        student_username: submission.student_username || '-',
        assignment_title: submission.assignment_title,
      }
    })

    const unsubmitted = students
      .filter((student) => !submittedUserIds.has(student.id))
      .map((student) => ({
        id: student.id,
        username: student.username,
        real_name: student.real_name,
        role: student.role,
      }))

    return {
      submitted,
      unsubmitted,
      total: students.length,
      submitted_count: submitted.length,
      unsubmitted_count: unsubmitted.length,
    }
  }

  async getDownloadTarget(submissionId: number, user: AuthUser, requestedIndexValue?: unknown): Promise<AssignmentDownloadTarget> {
    const submission = await assignmentRepository.findSubmissionById(submissionId)

    if (!submission) {
      throw new AppError('Submission not found', 404, ERROR_CODES.NOT_FOUND)
    }

    if (!submission.file_url) {
      throw new AppError('File not found', 404, ERROR_CODES.NOT_FOUND)
    }

    if (user.role !== 'admin' && user.id !== submission.user_id) {
      throw new AppError('无权下载该作业文件', 403, ERROR_CODES.FORBIDDEN)
    }

    const normalizedFileUrls = normalizeFileUrls(submission.file_url)
    const requestedIndex = Number.parseInt(String(requestedIndexValue ?? '0'), 10)
    const fileIndex = Number.isNaN(requestedIndex) ? 0 : Math.max(0, requestedIndex)
    const fileUrl = normalizedFileUrls[fileIndex] || normalizedFileUrls[0] || submission.file_url

    if (!fileUrl) {
      throw new AppError('File not found', 404, ERROR_CODES.NOT_FOUND)
    }

    const ext = path.extname(fileUrl)
    const studentName = submission.student_name || '未知学员'
    const assignmentTitle = submission.assignment_title || '作业'
    const downloadFileName = `${studentName}_${assignmentTitle}${ext}`

    return {
      fileUrl,
      downloadFileName,
      contentType: getContentType(ext),
      localPath: fileUrl.startsWith('http') ? undefined : path.join(__dirname, '../../../', fileUrl.replace('/uploads/', 'uploads/')),
    }
  }

  async streamRemote(url: string) {
    try {
      return await axios.get(url, {
        responseType: 'stream',
        maxRedirects: 5,
        timeout: 300000,
      })
    } catch (error: any) {
      const status = Number(error?.response?.status || 0)
      if (status === 404) {
        throw new AppError('作业附件不存在或已失效', 404, ERROR_CODES.NOT_FOUND)
      }
      if (status === 403) {
        throw new AppError('作业附件暂时无法访问', 403, ERROR_CODES.FORBIDDEN)
      }
      throw new AppError('作业附件下载失败', 502, ERROR_CODES.INTERNAL_SERVER_ERROR)
    }
  }
}

export const assignmentService = new AssignmentService()

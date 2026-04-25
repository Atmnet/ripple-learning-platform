import { Request, Response } from 'express'
import { AssignmentModel } from '../models/Assignment'
import { AssignmentSubmissionModel } from '../models/AssignmentSubmission'
import { UserModel } from '../models/User'
import { AuthRequest } from '../middleware/auth'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import * as https from 'https'

const assignmentModel = new AssignmentModel()
const submissionModel = new AssignmentSubmissionModel()
const userModel = new UserModel()

const normalizeFileUrls = (fileUrlsInput: unknown, fallbackFileUrl?: unknown): string[] => {
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

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, deadline, file_url, file_urls } = req.body

    if (!title || !deadline) {
      return res.status(400).json({ error: 'Title and deadline are required' })
    }

    const normalizedFileUrls = normalizeFileUrls(file_urls, file_url)
    const finalFileUrl = normalizedFileUrls.length > 0 ? JSON.stringify(normalizedFileUrls) : null

    const assignment = await assignmentModel.create({
      title,
      description,
      deadline,
      file_url: finalFileUrl,
      created_by: req.user!.id
    })

    res.status(201).json(assignment)
  } catch (error) {
    console.error('Create assignment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined
    const search = typeof req.query.search === 'string' ? req.query.search : undefined

    const result = await assignmentModel.findAll(page, limit, search)
    res.json(result)
  } catch (error) {
    console.error('Get assignments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const assignment = await assignmentModel.findById(parseInt(id))

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    res.json(assignment)
  } catch (error) {
    console.error('Get assignment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { file_urls, comment } = req.body
    const finalFileUrls = normalizeFileUrls(file_urls, req.body.file_url)

    if (finalFileUrls.length === 0) {
      return res.status(400).json({ error: '请上传作业文件' })
    }

    // 将文件URL数组转换为JSON字符串存储
    const fileUrlJson = JSON.stringify(finalFileUrls)

    const assignment = await assignmentModel.findById(parseInt(id))
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    // 检查作业是否已过截止日期
    const now = new Date()
    const deadline = new Date(assignment.deadline)
    if (now > deadline) {
      return res.status(400).json({ error: '已超过作业截止日期，无法提交' })
    }

    const existingSubmission = await submissionModel.findByUserAndAssignment(req.user!.id, parseInt(id))
    if (existingSubmission) {
      return res.status(409).json({ error: '该作业已提交，不能重复提交' })
    }

    const submission = await submissionModel.create({
      assignment_id: parseInt(id),
      user_id: req.user!.id,
      file_url: fileUrlJson,
      comment
    })

    res.status(201).json({
      ...submission,
      is_update: false
    })
  } catch (error) {
    console.error('Submit assignment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const gradeAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId, grade, feedback } = req.body

    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' })
    }

    if (grade === undefined || grade === null) {
      return res.status(400).json({ error: 'Grade is required' })
    }

    const submission = await submissionModel.updateGrade(parseInt(submissionId), grade, feedback, req.user!.id)

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    res.json(submission)
  } catch (error) {
    console.error('Grade assignment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getSubmissionsByAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const submissions = await submissionModel.findByAssignmentId(parseInt(id))
    res.json(submissions)
  } catch (error) {
    console.error('Get submissions by assignment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, deadline, file_url, file_urls } = req.body

    const existingAssignment = await assignmentModel.findById(parseInt(id))
    if (!existingAssignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    const normalizedFileUrls = normalizeFileUrls(file_urls, file_url)

    const updatedAssignment = await assignmentModel.update(parseInt(id), {
      title,
      description,
      deadline,
      file_url: normalizedFileUrls.length > 0 ? JSON.stringify(normalizedFileUrls) : null
    })

    res.json(updatedAssignment)
  } catch (error) {
    console.error('Update assignment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const existingAssignment = await assignmentModel.findById(parseInt(id))
    if (!existingAssignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    await assignmentModel.delete(parseInt(id))
    res.json({ message: 'Assignment deleted successfully' })
  } catch (error) {
    console.error('Delete assignment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await submissionModel.findByUserId(req.user!.id)
    res.json(submissions)
  } catch (error) {
    console.error('Get my submissions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 获取所有学员的提交状态（包括未提交的）- 管理员用
export const getAllStudentsSubmissionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const assignmentId = parseInt(id)

    // 获取所有学员
    const allUsers = await userModel.findAll()
    const students = allUsers.filter(user => user.role === 'student')

    // 获取已提交的学员
    const submissions = await submissionModel.findByAssignmentId(assignmentId)
    // 分离已提交和未提交的学员
    const submittedUserIds = new Set(submissions.map(s => s.user_id))

    const submitted = submissions.map(s => {
      const fileUrls = normalizeFileUrls(s.file_url)
      return {
        id: s.id,
        assignment_id: s.assignment_id,
        user_id: s.user_id,
        file_url: s.file_url || null,
        file_urls: fileUrls,  // 解析后的文件URL数组
        file_count: fileUrls.length,  // 文件数量
        comment: s.comment,
        grade: s.grade,
        feedback: s.feedback,
        submitted_at: s.submitted_at,
        graded_at: s.graded_at,
        graded_by: s.graded_by,
        student_name: s.student_name || '未知',
        student_username: s.student_username || '-',
        assignment_title: s.assignment_title
      }
    })

    const unsubmitted = students
      .filter(s => !submittedUserIds.has(s.id))
      .map(s => ({
        id: s.id,
        username: s.username,
        real_name: s.real_name,
        role: s.role
      }))

    res.json({
      submitted,
      unsubmitted,
      total: students.length,
      submitted_count: submitted.length,
      unsubmitted_count: unsubmitted.length
    })
  } catch (error) {
    console.error('Get all students submission status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 下载学员提交的作业文件
export const downloadSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params
    const requestedIndex = Number.parseInt(String(req.query.index ?? '0'), 10)
    const submission = await submissionModel.findById(parseInt(submissionId))

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    if (!submission.file_url) {
      return res.status(404).json({ error: 'File not found' })
    }

    if (req.user?.role !== 'admin' && req.user?.id !== submission.user_id) {
      return res.status(403).json({ error: '无权下载该作业文件' })
    }

    // 解析 file_url（可能是 JSON 数组或单个 URL）
    const normalizedFileUrls = normalizeFileUrls(submission.file_url)
    const fileIndex = Number.isNaN(requestedIndex) ? 0 : Math.max(0, requestedIndex)
    const fileUrl = normalizedFileUrls[fileIndex] || normalizedFileUrls[0] || submission.file_url

    if (!fileUrl) {
      return res.status(404).json({ error: 'File not found' })
    }

    // 获取文件扩展名
    const ext = path.extname(fileUrl)
    // 构建文件名：学员姓名_作业标题.扩展名
    const studentName = submission.student_name || '未知学员'
    const assignmentTitle = submission.assignment_title || '作业'
    const downloadFileName = `${studentName}_${assignmentTitle}${ext}`

    // 设置Content-Type
    const contentType = getContentType(ext)
    res.setHeader('Content-Type', contentType)

    // 设置下载文件名 - 使用RFC 5987编码支持中文
    // filename 使用纯ASCII作为fallback，filename* 使用UTF-8编码
    const encodedFilename = encodeURIComponent(downloadFileName)
    const safeFilename = `submission_${submissionId}${ext}`
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`)

    // 如果是BOS URL（以http开头）
    if (fileUrl.startsWith('http')) {
      // 代理下载BOS文件，确保中文文件名正确
      try {
        const parsedUrl = new URL(fileUrl)
        const client = parsedUrl.protocol === 'https:' ? https : http

        const proxyReq = client.get(fileUrl, (proxyRes) => {
          if (proxyRes.statusCode !== 200) {
            console.error('BOS proxy download error, status:', proxyRes.statusCode)
            return res.status(502).json({ error: 'Failed to download file from BOS' })
          }

          proxyRes.pipe(res)
        })

        proxyReq.on('error', (err) => {
          console.error('BOS proxy download error:', err)
          return res.status(502).json({ error: 'Failed to download file from BOS' })
        })

        return
      } catch (error) {
        console.error('BOS proxy download error:', error)
        return res.status(500).json({ error: 'Failed to download file from BOS' })
      }
    }

    // 本地文件
    const localPath = path.join(__dirname, '../../', fileUrl.replace('/uploads/', 'uploads/'))

    if (!fs.existsSync(localPath)) {
      return res.status(404).json({ error: 'File not found on server' })
    }

    // 发送文件
    res.sendFile(path.resolve(localPath))
  } catch (error) {
    console.error('Download submission error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 获取文件Content-Type
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
    '.7z': 'application/x-7z-compressed'
  }
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
}

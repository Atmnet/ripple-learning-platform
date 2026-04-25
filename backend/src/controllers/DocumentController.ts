import { Request, Response } from 'express'
import { DocumentModel } from '../models/Document'
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth'
import { deleteFile } from '../utils/bosUploader'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'

const documentModel = new DocumentModel()

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string
    const documents = await documentModel.findAll(category)
    res.json(documents)
  } catch (error) {
    console.error('Get documents error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const document = await documentModel.findById(parseInt(id))

    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }

    res.json(document)
  } catch (error) {
    console.error('Get document error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, file_url, description } = req.body

    if (!title || !category || !file_url) {
      return res.status(400).json({ error: 'Title, category and file_url are required' })
    }

    const document = await documentModel.create({
      title,
      category,
      file_url,
      description,
      uploaded_by: req.user!.id
    })

    res.status(201).json(document)
  } catch (error) {
    console.error('Create document error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { title, category, file_url, description } = req.body

    const document = await documentModel.findById(parseInt(id))
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }

    const updatedDocument = await documentModel.update(parseInt(id), {
      title,
      category,
      file_url,
      description
    })

    res.json(updatedDocument)
  } catch (error) {
    console.error('Update document error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const document = await documentModel.findById(parseInt(id))
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }

    // 只有管理员可以删除
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    // 从BOS或本地删除文件
    if (document.file_url) {
      await deleteFile(document.file_url)
    }

    await documentModel.delete(parseInt(id))
    res.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Delete document error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 下载文档
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const document = await documentModel.findById(parseInt(id))

    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }

    if (!document.file_url) {
      return res.status(404).json({ error: 'File not found' })
    }

    // 获取文件扩展名
    const ext = path.extname(document.file_url)
    // 构建带扩展名的文件名
    let downloadFileName = document.title
    if (!downloadFileName.includes('.') && ext) {
      downloadFileName = `${document.title}${ext}`
    }

    // 设置Content-Type
    const contentType = getContentType(ext)
    res.setHeader('Content-Type', contentType)

    // 设置下载文件名 - 使用RFC 5987编码支持中文
    // filename 使用纯ASCII作为fallback，filename* 使用UTF-8编码
    const encodedFilename = encodeURIComponent(downloadFileName)
    const safeFilename = `document_${id}${ext}`
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`)

    // 如果是BOS URL（以http开头）
    if (document.file_url.startsWith('http')) {
      // 代理下载BOS文件，确保中文文件名正确
      try {
        const response = await axios.get(document.file_url, {
          responseType: 'stream'
        })
        response.data.pipe(res)
        return
      } catch (error) {
        console.error('BOS proxy download error:', error)
        return res.status(500).json({ error: 'Failed to download file from BOS' })
      }
    }

    // 本地文件
    const localPath = path.join(__dirname, '../../', document.file_url.replace('/uploads/', 'uploads/'))

    if (!fs.existsSync(localPath)) {
      return res.status(404).json({ error: 'File not found on server' })
    }

    // 发送文件
    res.sendFile(path.resolve(localPath))
  } catch (error) {
    console.error('Download document error:', error)
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
    '.rar': 'application/x-rar-compressed'
  }
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
}

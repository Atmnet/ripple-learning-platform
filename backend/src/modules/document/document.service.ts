import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { deleteFile } from '../../utils/bosUploader'
import { DocumentRepository } from './document.repository'

const documentRepository = new DocumentRepository()

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
  }
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
}

export class DocumentService {
  getDocuments(category?: string) {
    return documentRepository.findAll(category)
  }

  async getDocumentById(id: number) {
    const document = await documentRepository.findById(id)
    if (!document) {
      throw new AppError('Document not found', 404, ERROR_CODES.NOT_FOUND)
    }
    return document
  }

  async createDocument(payload: { title?: string; category?: string; file_url?: string; description?: string }, userId: number) {
    if (!payload.title || !payload.category || !payload.file_url) {
      throw new AppError('Title, category and file_url are required', 400, ERROR_CODES.BAD_REQUEST)
    }

    return documentRepository.create({
      title: payload.title,
      category: payload.category,
      file_url: payload.file_url,
      description: payload.description,
      uploaded_by: userId,
    })
  }

  async updateDocument(id: number, payload: { title?: string; category?: string; file_url?: string; description?: string }) {
    await this.getDocumentById(id)
    return documentRepository.update(id, payload)
  }

  async deleteDocument(id: number) {
    const document = await this.getDocumentById(id)
    if (document.file_url) {
      await deleteFile(document.file_url)
    }
    await documentRepository.delete(id)
  }

  async getDownloadInfo(id: number) {
    const document = await this.getDocumentById(id)
    if (!document.file_url) {
      throw new AppError('File not found', 404, ERROR_CODES.NOT_FOUND)
    }

    const ext = path.extname(document.file_url)
    const downloadFileName = document.title.includes('.') || !ext ? document.title : `${document.title}${ext}`
    const localPath = document.file_url.startsWith('http')
      ? null
      : path.join(__dirname, '../../../', document.file_url.replace('/uploads/', 'uploads/'))

    return {
      document,
      ext,
      downloadFileName,
      contentType: getContentType(ext),
      localPath,
    }
  }

  async streamRemote(url: string) {
    return axios.get(url, { responseType: 'stream' })
  }

  existsLocalFile(filePath: string) {
    return fs.existsSync(filePath)
  }
}

export const documentService = new DocumentService()

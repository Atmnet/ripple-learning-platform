import path from 'path'
import { Request, Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { sendError, sendMessage } from '../../shared/utils/response'
import { documentService } from './document.service'

export async function getDocuments(req: Request, res: Response): Promise<void> {
  try {
    const documents = await documentService.getDocuments(req.query.category as string | undefined)
    res.json(documents)
  } catch (error) {
    console.error('Get documents error:', error)
    sendError(res, error)
  }
}

export async function getDocumentById(req: Request, res: Response): Promise<void> {
  try {
    const document = await documentService.getDocumentById(Number.parseInt(req.params.id, 10))
    res.json(document)
  } catch (error) {
    console.error('Get document error:', error)
    sendError(res, error)
  }
}

export async function createDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const document = await documentService.createDocument(req.body, req.user!.id)
    res.status(201).json(document)
  } catch (error) {
    console.error('Create document error:', error)
    sendError(res, error)
  }
}

export async function updateDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const document = await documentService.updateDocument(Number.parseInt(req.params.id, 10), req.body)
    res.json(document)
  } catch (error) {
    console.error('Update document error:', error)
    sendError(res, error)
  }
}

export async function deleteDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    await documentService.deleteDocument(Number.parseInt(req.params.id, 10))
    sendMessage(res, 'Document deleted successfully')
  } catch (error) {
    console.error('Delete document error:', error)
    sendError(res, error)
  }
}

export async function downloadDocument(req: Request, res: Response): Promise<void> {
  try {
    const info = await documentService.getDownloadInfo(Number.parseInt(req.params.id, 10))
    const encodedFilename = encodeURIComponent(info.downloadFileName)
    const safeFilename = `document_${req.params.id}${info.ext}`

    res.setHeader('Content-Type', info.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`)

    if (info.document.file_url.startsWith('http')) {
      const response = await documentService.streamRemote(info.document.file_url)
      response.data.pipe(res)
      return
    }

    if (!info.localPath || !documentService.existsLocalFile(info.localPath)) {
      throw new Error('File not found on server')
    }

    res.sendFile(path.resolve(info.localPath))
  } catch (error) {
    console.error('Download document error:', error)
    sendError(res, error)
  }
}

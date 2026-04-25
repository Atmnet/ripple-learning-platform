import { Request, Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { sendError, sendMessage } from '../../shared/utils/response'
import { videoService } from './video.service'

export async function getVideoResources(req: Request, res: Response): Promise<void> {
  try {
    const resources = await videoService.getVideoResources(req.query.category as string | undefined)
    res.json(resources)
  } catch (error) {
    console.error('Get video resources error:', error)
    sendError(res, error)
  }
}

export async function getVideoResourceById(req: Request, res: Response): Promise<void> {
  try {
    const resource = await videoService.getVideoResourceById(Number(req.params.id))
    res.json(resource)
  } catch (error) {
    console.error('Get video resource error:', error)
    sendError(res, error)
  }
}

export async function createVideoResource(req: AuthRequest, res: Response): Promise<void> {
  try {
    const resource = await videoService.createVideoResource(req.body, req.user!.id)
    res.status(201).json(resource)
  } catch (error) {
    console.error('Create video resource error:', error)
    sendError(res, error)
  }
}

export async function updateVideoResource(req: AuthRequest, res: Response): Promise<void> {
  try {
    const updated = await videoService.updateVideoResource(Number(req.params.id), req.body)
    res.json(updated)
  } catch (error) {
    console.error('Update video resource error:', error)
    sendError(res, error)
  }
}

export async function deleteVideoResource(req: AuthRequest, res: Response): Promise<void> {
  try {
    await videoService.deleteVideoResource(Number(req.params.id))
    sendMessage(res, 'Video resource deleted successfully')
  } catch (error) {
    console.error('Delete video resource error:', error)
    sendError(res, error)
  }
}

export async function getVideoCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await videoService.getVideoCategories()
    res.json(categories)
  } catch (error) {
    console.error('Get video categories error:', error)
    sendError(res, error)
  }
}

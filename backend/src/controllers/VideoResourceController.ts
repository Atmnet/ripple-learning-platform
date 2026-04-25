import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { VideoResourceModel } from '../models/VideoResource'

const videoResourceModel = new VideoResourceModel()

const normalizeTags = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(',')
  }

  const text = String(value || '').trim()
  return text || null
}

const toBilibiliEmbedUrl = (rawUrl: string): string => {
  const text = rawUrl.trim()

  if (text.includes('player.bilibili.com/player.html')) {
    return text
  }

  const bvMatch = text.match(/BV([A-Za-z0-9]+)/i)
  if (bvMatch) {
    return `https://player.bilibili.com/player.html?bvid=BV${bvMatch[1]}&page=1`
  }

  const avMatch = text.match(/av(\d+)/i)
  if (avMatch) {
    return `https://player.bilibili.com/player.html?aid=${avMatch[1]}&page=1`
  }

  return text
}

const normalizeVideoUrl = (rawUrl: string): string => {
  const text = rawUrl.trim()

  if (/(bilibili\.com|b23\.tv)/i.test(text)) {
    return toBilibiliEmbedUrl(text)
  }

  return text
}

export const getVideoResources = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined
    const resources = await videoResourceModel.findAll(category)
    res.json(resources)
  } catch (error) {
    console.error('Get video resources error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getVideoResourceById = async (req: Request, res: Response) => {
  try {
    const resource = await videoResourceModel.findById(Number(req.params.id))

    if (!resource) {
      return res.status(404).json({ error: 'Video resource not found' })
    }

    res.json(resource)
  } catch (error) {
    console.error('Get video resource error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createVideoResource = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, description, embed_url, source_name, duration_text, tags } = req.body

    if (!title || !category || !embed_url) {
      return res.status(400).json({ error: 'Title, category and embed_url are required' })
    }

    const resource = await videoResourceModel.create({
      title: String(title).trim(),
      category: String(category).trim(),
      description: description ? String(description).trim() : null,
      embed_url: normalizeVideoUrl(String(embed_url)),
      source_name: source_name ? String(source_name).trim() : null,
      duration_text: duration_text ? String(duration_text).trim() : null,
      tags: normalizeTags(tags),
      created_by: req.user!.id
    })

    res.status(201).json(resource)
  } catch (error) {
    console.error('Create video resource error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateVideoResource = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await videoResourceModel.findById(id)

    if (!existing) {
      return res.status(404).json({ error: 'Video resource not found' })
    }

    const { title, category, description, embed_url, source_name, duration_text, tags } = req.body
    const updated = await videoResourceModel.update(id, {
      title: title !== undefined ? String(title).trim() : undefined,
      category: category !== undefined ? String(category).trim() : undefined,
      description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
      embed_url: embed_url !== undefined ? normalizeVideoUrl(String(embed_url)) : undefined,
      source_name: source_name !== undefined ? (source_name ? String(source_name).trim() : null) : undefined,
      duration_text: duration_text !== undefined ? (duration_text ? String(duration_text).trim() : null) : undefined,
      tags: tags !== undefined ? normalizeTags(tags) : undefined
    })

    res.json(updated)
  } catch (error) {
    console.error('Update video resource error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteVideoResource = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await videoResourceModel.findById(id)

    if (!existing) {
      return res.status(404).json({ error: 'Video resource not found' })
    }

    await videoResourceModel.delete(id)
    res.json({ message: 'Video resource deleted successfully' })
  } catch (error) {
    console.error('Delete video resource error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getVideoCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await videoResourceModel.getCategories()
    res.json(categories)
  } catch (error) {
    console.error('Get video categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

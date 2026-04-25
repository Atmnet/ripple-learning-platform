import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { VideoRepository } from './video.repository'

const videoRepository = new VideoRepository()

const normalizeTags = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(',')
  }
  const text = String(value || '').trim()
  return text || null
}

const toBilibiliEmbedUrl = (rawUrl: string): string => {
  const text = rawUrl.trim()
  if (text.includes('player.bilibili.com/player.html')) return text
  const bvMatch = text.match(/BV([A-Za-z0-9]+)/i)
  if (bvMatch) return `https://player.bilibili.com/player.html?bvid=BV${bvMatch[1]}&page=1`
  const avMatch = text.match(/av(\d+)/i)
  if (avMatch) return `https://player.bilibili.com/player.html?aid=${avMatch[1]}&page=1`
  return text
}

const normalizeVideoUrl = (rawUrl: string): string => {
  const text = rawUrl.trim()
  return /(bilibili\.com|b23\.tv)/i.test(text) ? toBilibiliEmbedUrl(text) : text
}

export class VideoService {
  getVideoResources(category?: string) {
    return videoRepository.findAll(category)
  }

  async getVideoResourceById(id: number) {
    const resource = await videoRepository.findById(id)
    if (!resource) throw new AppError('Video resource not found', 404, ERROR_CODES.NOT_FOUND)
    return resource
  }

  async createVideoResource(payload: any, userId: number) {
    const { title, category, description, embed_url, source_name, duration_text, tags } = payload
    if (!title || !category || !embed_url) {
      throw new AppError('Title, category and embed_url are required', 400, ERROR_CODES.BAD_REQUEST)
    }

    return videoRepository.create({
      title: String(title).trim(),
      category: String(category).trim(),
      description: description ? String(description).trim() : null,
      embed_url: normalizeVideoUrl(String(embed_url)),
      source_name: source_name ? String(source_name).trim() : null,
      duration_text: duration_text ? String(duration_text).trim() : null,
      tags: normalizeTags(tags),
      created_by: userId,
    })
  }

  async updateVideoResource(id: number, payload: any) {
    await this.getVideoResourceById(id)
    const { title, category, description, embed_url, source_name, duration_text, tags } = payload
    return videoRepository.update(id, {
      title: title !== undefined ? String(title).trim() : undefined,
      category: category !== undefined ? String(category).trim() : undefined,
      description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
      embed_url: embed_url !== undefined ? normalizeVideoUrl(String(embed_url)) : undefined,
      source_name: source_name !== undefined ? (source_name ? String(source_name).trim() : null) : undefined,
      duration_text: duration_text !== undefined ? (duration_text ? String(duration_text).trim() : null) : undefined,
      tags: tags !== undefined ? normalizeTags(tags) : undefined,
    })
  }

  async deleteVideoResource(id: number) {
    await this.getVideoResourceById(id)
    await videoRepository.delete(id)
  }

  getVideoCategories() {
    return videoRepository.getCategories()
  }
}

export const videoService = new VideoService()

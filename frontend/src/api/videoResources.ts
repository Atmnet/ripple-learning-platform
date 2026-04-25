import api from './index'

export interface VideoResourcePayload {
  title: string
  category: string
  description?: string
  embed_url: string
  source_name?: string
  duration_text?: string
  tags?: string
}

export const getVideoResources = (category?: string) => {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return api.get(`/videos${query}`)
}

export const getVideoCategories = () => api.get('/videos/categories')

export const createVideoResource = (payload: VideoResourcePayload) => api.post('/videos', payload)

export const updateVideoResource = (id: number, payload: Partial<VideoResourcePayload>) => api.put(`/videos/${id}`, payload)

export const deleteVideoResource = (id: number) => api.delete(`/videos/${id}`)

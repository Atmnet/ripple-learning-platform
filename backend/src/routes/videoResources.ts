import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth'
import {
  createVideoResource,
  deleteVideoResource,
  getVideoCategories,
  getVideoResourceById,
  getVideoResources,
  updateVideoResource
} from '../modules/video/video.controller'

const router = Router()

router.get('/', getVideoResources)
router.get('/categories', getVideoCategories)
router.get('/:id', getVideoResourceById)

router.post('/', authenticateToken, requireAdmin, createVideoResource)
router.put('/:id', authenticateToken, requireAdmin, updateVideoResource)
router.delete('/:id', authenticateToken, requireAdmin, deleteVideoResource)

export default router

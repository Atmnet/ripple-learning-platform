import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth'
import { getAppSettings, getPublicAppSettings, updateAppSettings } from '../modules/app-settings/app-settings.controller'

const router = Router()

router.get('/public', getPublicAppSettings)
router.get('/', authenticateToken, requireAdmin, getAppSettings)
router.put('/', authenticateToken, requireAdmin, updateAppSettings)

export default router

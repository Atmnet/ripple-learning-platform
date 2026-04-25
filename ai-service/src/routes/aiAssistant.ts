import { Router } from 'express'
import {
  chatWithAssistant,
  createAnonymousSession,
  resetAssistantSession,
} from '../modules/ai-assistant/ai-assistant.controller'

const router = Router()

router.get('/session', createAnonymousSession)
router.post('/chat', chatWithAssistant)
router.post('/reset', resetAssistantSession)

export default router

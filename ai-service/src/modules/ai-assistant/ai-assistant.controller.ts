import { Request, Response } from 'express'
import { sendError } from '../../shared/utils/response'
import { aiAssistantService } from './ai-assistant.service'

export async function createAnonymousSession(_req: Request, res: Response): Promise<void> {
  try {
    res.json(aiAssistantService.createAnonymousSession())
  } catch (error) {
    sendError(res, error)
  }
}

export async function resetAssistantSession(req: Request, res: Response): Promise<void> {
  try {
    res.json(aiAssistantService.resetSession(String(req.body?.sessionId || '').trim()))
  } catch (error) {
    sendError(res, error)
  }
}

export async function chatWithAssistant(req: Request, res: Response): Promise<void> {
  try {
    const result = await aiAssistantService.chat(
      String(req.body?.sessionId || '').trim(),
      String(req.body?.message || '').trim()
    )
    res.json(result)
  } catch (error) {
    console.error('AI assistant chat error:', error)
    sendError(res, error)
  }
}

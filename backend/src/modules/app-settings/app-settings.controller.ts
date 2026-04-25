import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../shared/utils/response'
import { appSettingsService } from './app-settings.service'

export async function getAppSettings(_req: Request, res: Response): Promise<void> {
  try {
    const settings = await appSettingsService.getSettings()
    sendSuccess(res, settings)
  } catch (error) {
    sendError(res, error)
  }
}

export async function updateAppSettings(req: Request, res: Response): Promise<void> {
  try {
    const settings = await appSettingsService.updateSettings(req.body || {})
    sendSuccess(res, settings)
  } catch (error) {
    sendError(res, error)
  }
}

export async function getPublicAppSettings(_req: Request, res: Response): Promise<void> {
  try {
    const settings = await appSettingsService.getPublicSettings()
    sendSuccess(res, settings)
  } catch (error) {
    sendError(res, error)
  }
}

import { Request, Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { sendError } from '../../shared/utils/response'
import { authService } from './auth.service'

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body.username, req.body.password)
    res.json(result)
  } catch (error) {
    console.error('Login error:', error)
    sendError(res, error)
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body.username, req.body.password, req.body.real_name)
    res.status(201).json(result)
  } catch (error) {
    console.error('Registration error:', error)
    sendError(res, error)
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await authService.getCurrentUser(req.user!.id)
    res.json(user)
  } catch (error) {
    console.error('Get current user error:', error)
    sendError(res, error)
  }
}

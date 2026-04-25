import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { sendError, sendMessage } from '../../shared/utils/response'
import { usersService } from './users.service'

export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Number.parseInt(String(req.query.page ?? '1'), 10)
    const limit = Number.parseInt(String(req.query.limit ?? '10'), 10)
    const search = String(req.query.search ?? '')
    const users = await usersService.getAllUsers(page, limit, search)
    res.json(users)
  } catch (error) {
    console.error('Get all users error:', error)
    sendError(res, error)
  }
}

export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await usersService.createUser(req.body.username, req.body.password, req.body.real_name, req.body.role)
    res.status(201).json(user)
  } catch (error) {
    console.error('Create user error:', error)
    sendError(res, error)
  }
}

export async function resetPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    await usersService.resetPassword(Number.parseInt(req.params.id, 10), req.body.newPassword)
    sendMessage(res, '密码重置成功')
  } catch (error) {
    console.error('Reset password error:', error)
    sendError(res, error)
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    await usersService.deleteUser(Number.parseInt(req.params.id, 10), req.user!.id)
    sendMessage(res, '用户删除成功')
  } catch (error) {
    console.error('Delete user error:', error)
    sendError(res, error)
  }
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await usersService.updateUser(Number.parseInt(req.params.id, 10), req.body.real_name, req.body.role)
    res.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    sendError(res, error)
  }
}

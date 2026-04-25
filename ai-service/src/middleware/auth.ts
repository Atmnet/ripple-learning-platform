import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/User'

const userModel = new UserModel()

export interface AuthRequest extends Request {
  user?: {
    id: number
    username: string
    real_name: string
    role: string
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' })
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
    const decoded = jwt.verify(token, jwtSecret as jwt.Secret) as { userId?: number }
    const userId = Number(decoded.userId)

    if (!userId) {
      return res.status(403).json({ success: false, error: 'Invalid token' })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    req.user = {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role,
    }

    next()
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' })
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' })
  }

  next()
}

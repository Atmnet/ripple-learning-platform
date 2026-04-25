import { Request, Response, NextFunction } from 'express'
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

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
    const decoded = jwt.verify(token, jwtSecret as jwt.Secret) as any
    const user = await userModel.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    return res.status(401).json({ error: 'Authentication failed' })
  }
}

export const authenticateOptional = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    next()
    return
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
    const decoded = jwt.verify(token, jwtSecret as jwt.Secret) as any
    const user = await userModel.findById(decoded.userId)

    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        role: user.role
      }
    }
  } catch {
    req.user = undefined
  }

  next()
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

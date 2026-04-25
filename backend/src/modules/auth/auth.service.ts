import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { appSettingsService } from '../app-settings/app-settings.service'
import { AuthRepository } from './auth.repository'

const authRepository = new AuthRepository()

function signToken(user: { id: number; username: string; role: string }) {
  const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    jwtSecret as jwt.Secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
  )
}

export class AuthService {
  async login(username: string, password: string) {
    if (!username || !password) {
      throw new AppError('Username and password are required', 400, ERROR_CODES.BAD_REQUEST)
    }

    const user = await authRepository.findByUsername(username)
    if (!user) {
      throw new AppError('Invalid username or password', 401, ERROR_CODES.UNAUTHORIZED)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError('Invalid username or password', 401, ERROR_CODES.UNAUTHORIZED)
    }

    return {
      token: signToken(user),
      user: {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        role: user.role,
      },
    }
  }

  async register(username: string, password: string, realName: string) {
    const settings = await appSettingsService.getSettings()
    if (!settings.allowRegistration) {
      throw new AppError('当前已关闭学员注册，请联系管理员开通账号', 403, ERROR_CODES.FORBIDDEN)
    }

    if (!username || !password || !realName) {
      throw new AppError('All fields are required', 400, ERROR_CODES.BAD_REQUEST)
    }

    const existingUser = await authRepository.findByUsername(username)
    if (existingUser) {
      throw new AppError('Username already exists', 409, ERROR_CODES.BAD_REQUEST)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await authRepository.createUser({
      username,
      password: hashedPassword,
      real_name: realName,
      role: 'student',
    })

    return {
      token: signToken(newUser),
      user: {
        id: newUser.id,
        username: newUser.username,
        real_name: newUser.real_name,
        role: newUser.role,
      },
    }
  }

  async getCurrentUser(userId: number) {
    const user = await authRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND)
    }

    return {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role,
    }
  }
}

export const authService = new AuthService()

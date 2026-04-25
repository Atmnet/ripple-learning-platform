import bcrypt from 'bcryptjs'
import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { UsersRepository } from './users.repository'

const usersRepository = new UsersRepository()

export class UsersService {
  async getAllUsers(page = 1, limit = 10, search = '') {
    const result = await usersRepository.findAll(page, limit, search)
    return {
      data: result.data.map((user) => ({
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        role: user.role,
        created_at: user.created_at,
      })),
      total: result.total,
    }
  }

  async createUser(username: string, password: string, realName: string, role = 'student') {
    if (!username || !password || !realName) {
      throw new AppError('用户名、密码和姓名都是必填项', 400, ERROR_CODES.BAD_REQUEST)
    }

    const existingUser = await usersRepository.findByUsername(username)
    if (existingUser) {
      throw new AppError('用户名已存在', 409, ERROR_CODES.BAD_REQUEST)
    }

    if (password.length < 6) {
      throw new AppError('密码长度至少 6 位', 400, ERROR_CODES.BAD_REQUEST)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await usersRepository.create({
      username,
      password: hashedPassword,
      real_name: realName,
      role: role as 'student' | 'admin',
    })

    return {
      id: newUser.id,
      username: newUser.username,
      real_name: newUser.real_name,
      role: newUser.role,
      created_at: newUser.created_at,
    }
  }

  async resetPassword(id: number, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('新密码长度至少 6 位', 400, ERROR_CODES.BAD_REQUEST)
    }

    const user = await usersRepository.findById(id)
    if (!user) {
      throw new AppError('用户不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await usersRepository.updatePassword(id, hashedPassword)
  }

  async deleteUser(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new AppError('不能删除自己的账户', 400, ERROR_CODES.BAD_REQUEST)
    }

    const user = await usersRepository.findById(id)
    if (!user) {
      throw new AppError('用户不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    await usersRepository.delete(id)
  }

  async updateUser(id: number, realName?: string, role?: string) {
    const user = await usersRepository.findById(id)
    if (!user) {
      throw new AppError('用户不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    const updatedUser = await usersRepository.update(id, { real_name: realName, role: role as 'student' | 'admin' })
    return {
      id: updatedUser!.id,
      username: updatedUser!.username,
      real_name: updatedUser!.real_name,
      role: updatedUser!.role,
    }
  }
}

export const usersService = new UsersService()

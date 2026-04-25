import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { UserModel } from '../models/User'

const userModel = new UserModel()

// 获取所有用户列表（仅管理员）
export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await userModel.findAll()
    // 不返回密码字段
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role,
      created_at: user.created_at
    }))
    res.json(safeUsers)
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 创建新用户（仅管理员）
export const createUser = async (req: any, res: Response) => {
  try {
    const { username, password, real_name, role = 'student' } = req.body

    if (!username || !password || !real_name) {
      return res.status(400).json({ error: '用户名、密码和姓名都是必填项' })
    }

    // 检查用户名是否已存在
    const existingUser = await userModel.findByUsername(username)
    if (existingUser) {
      return res.status(409).json({ error: '用户名已存在' })
    }

    // 密码长度验证
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await userModel.create({
      username,
      password: hashedPassword,
      real_name,
      role
    })

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      real_name: newUser.real_name,
      role: newUser.role,
      created_at: newUser.created_at
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 重置用户密码（仅管理员）
export const resetPassword = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度至少6位' })
    }

    const user = await userModel.findById(parseInt(id))
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await userModel.updatePassword(parseInt(id), hashedPassword)

    res.json({ message: '密码重置成功' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 删除用户（仅管理员）
export const deleteUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const currentUserId = req.user!.id

    // 不能删除自己
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({ error: '不能删除自己的账户' })
    }

    const user = await userModel.findById(parseInt(id))
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    await userModel.delete(parseInt(id))
    res.json({ message: '用户删除成功' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 更新用户信息（仅管理员）
export const updateUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { real_name, role } = req.body

    const user = await userModel.findById(parseInt(id))
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const updatedUser = await userModel.update(parseInt(id), { real_name, role })
    res.json({
      id: updatedUser!.id,
      username: updatedUser!.username,
      real_name: updatedUser!.real_name,
      role: updatedUser!.role
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

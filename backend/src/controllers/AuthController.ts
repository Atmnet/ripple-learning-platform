import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/User'

const userModel = new UserModel()

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const user = await userModel.findByUsername(username)
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      jwtSecret as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, real_name } = req.body

    if (!username || !password || !real_name) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existingUser = await userModel.findByUsername(username)
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await userModel.create({
      username,
      password: hashedPassword,
      real_name,
      role: 'student'
    })

    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, role: newUser.role },
      jwtSecret as jwt.Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    )

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        real_name: newUser.real_name,
        role: newUser.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = await userModel.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth'
import {
  createUser,
  deleteUser,
  getAllUsers,
  resetPassword,
  updateUser,
} from '../modules/users/users.controller'

const router = Router()

router.use(authenticateToken, requireAdmin)
router.get('/', getAllUsers)
router.post('/', createUser)
router.put('/:id', updateUser)
router.post('/:id/reset-password', resetPassword)
router.delete('/:id', deleteUser)

export default router

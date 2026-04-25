import { Router } from 'express'
import { authenticateOptional, authenticateToken, requireAdmin } from '../middleware/auth'
import {
  createAssignment,
  deleteAssignment,
  getAllStudentsSubmissionStatus,
  getAssignmentById,
  getAssignments,
  getMySubmissions,
  getSubmissionsByAssignment,
  gradeAssignment,
  submitAssignment,
  updateAssignment,
} from '../modules/assignment/assignment.controller'

const router = Router()

router.get('/', authenticateOptional, getAssignments)
router.get('/my-submissions', authenticateToken, getMySubmissions)
router.get('/:id', getAssignmentById)
router.get('/:id/submissions', authenticateToken, requireAdmin, getSubmissionsByAssignment)
router.get('/:id/all-status', authenticateToken, requireAdmin, getAllStudentsSubmissionStatus)

router.post('/:id/submit', authenticateToken, submitAssignment)
router.post('/', authenticateToken, requireAdmin, createAssignment)
router.put('/:id', authenticateToken, requireAdmin, updateAssignment)
router.delete('/:id', authenticateToken, requireAdmin, deleteAssignment)
router.post('/:id/grade', authenticateToken, requireAdmin, gradeAssignment)

export default router

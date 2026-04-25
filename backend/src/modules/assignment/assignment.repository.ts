import { AssignmentModel, type Assignment } from '../../models/Assignment'
import { AssignmentSubmissionModel, type AssignmentSubmission } from '../../models/AssignmentSubmission'
import { UserModel, type User } from '../../models/User'

export class AssignmentRepository {
  private assignmentModel = new AssignmentModel()
  private submissionModel = new AssignmentSubmissionModel()
  private userModel = new UserModel()

  createAssignment(data: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
    return this.assignmentModel.create(data)
  }

  getAssignments(page?: number, limit?: number, search?: string) {
    return this.assignmentModel.findAll(page, limit, search)
  }

  getAssignmentById(id: number): Promise<Assignment | null> {
    return this.assignmentModel.findById(id)
  }

  updateAssignment(id: number, data: Partial<Assignment>): Promise<Assignment | null> {
    return this.assignmentModel.update(id, data)
  }

  deleteAssignment(id: number): Promise<boolean> {
    return this.assignmentModel.delete(id)
  }

  createSubmission(data: Omit<AssignmentSubmission, 'id' | 'submitted_at'>): Promise<AssignmentSubmission> {
    return this.submissionModel.create(data)
  }

  findSubmissionById(id: number): Promise<AssignmentSubmission | null> {
    return this.submissionModel.findById(id)
  }

  findSubmissionByUserAndAssignment(userId: number, assignmentId: number): Promise<AssignmentSubmission | null> {
    return this.submissionModel.findByUserAndAssignment(userId, assignmentId)
  }

  findSubmissionsByUserId(userId: number): Promise<AssignmentSubmission[]> {
    return this.submissionModel.findByUserId(userId)
  }

  findSubmissionsByAssignmentId(assignmentId: number): Promise<AssignmentSubmission[]> {
    return this.submissionModel.findByAssignmentId(assignmentId)
  }

  updateGrade(id: number, grade: number, feedback?: string, gradedBy?: number): Promise<AssignmentSubmission | null> {
    return this.submissionModel.updateGrade(id, grade, feedback, gradedBy)
  }

  findAllUsers(): Promise<User[]> {
    return this.userModel.findAll()
  }
}

import { AssignmentSubmissionModel } from '../../models/AssignmentSubmission'

export class GradesRepository {
  private submissionModel = new AssignmentSubmissionModel()

  findAll() {
    return this.submissionModel.findAll()
  }

  updateGrade(id: number, grade: number, feedback?: string, gradedBy?: number) {
    return this.submissionModel.updateGrade(id, grade, feedback, gradedBy)
  }
}

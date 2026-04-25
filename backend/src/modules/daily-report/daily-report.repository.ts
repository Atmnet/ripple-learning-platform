import { DailyReportCommentModel, type DailyReportComment } from '../../models/DailyReportComment'
import { DailyReportModel, type DailyReport } from '../../models/DailyReport'
import { UserModel, type User } from '../../models/User'

export class DailyReportRepository {
  private dailyReportModel = new DailyReportModel()
  private commentModel = new DailyReportCommentModel()
  private userModel = new UserModel()

  createDailyReport(data: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>): Promise<DailyReport> {
    return this.dailyReportModel.create(data)
  }

  getDailyReports(startDate?: Date, endDate?: Date, page?: number, limit?: number, search?: string) {
    return this.dailyReportModel.findAll(startDate, endDate, page, limit, search)
  }

  getDailyReportsByUser(userId: number, startDate?: Date, endDate?: Date, page?: number, limit?: number, search?: string) {
    return this.dailyReportModel.findByUserId(userId, startDate, endDate, page, limit, search)
  }

  getDailyReportById(id: number): Promise<DailyReport | null> {
    return this.dailyReportModel.findById(id)
  }

  updateDailyReport(id: number, content: string): Promise<DailyReport | null> {
    return this.dailyReportModel.update(id, content)
  }

  deleteDailyReport(id: number): Promise<boolean> {
    return this.dailyReportModel.delete(id)
  }

  findByDate(date: string): Promise<DailyReport[]> {
    return this.dailyReportModel.findByDate(date)
  }

  findByUserIdAndDate(userId: number, date: string): Promise<DailyReport | null> {
    return this.dailyReportModel.findByUserIdAndDate(userId, date)
  }

  markAsReviewed(id: number): Promise<void> {
    return this.dailyReportModel.markAsReviewed(id)
  }

  createComment(data: Omit<DailyReportComment, 'id' | 'created_at' | 'updated_at' | 'is_read'>): Promise<DailyReportComment> {
    return this.commentModel.create(data)
  }

  getCommentsByReportId(reportId: number): Promise<DailyReportComment[]> {
    return this.commentModel.findByReportId(reportId)
  }

  getCommentById(id: number): Promise<DailyReportComment | null> {
    return this.commentModel.findById(id)
  }

  updateComment(id: number, content: string): Promise<DailyReportComment | null> {
    return this.commentModel.update(id, content)
  }

  deleteComment(id: number): Promise<boolean> {
    return this.commentModel.delete(id)
  }

  markCommentsAsReadForStudent(reportId: number): Promise<void> {
    return this.commentModel.markAsReadForStudent(reportId)
  }

  getUnreadCount(reportId: number, userId: number, userRole: string): Promise<number> {
    return this.commentModel.getUnreadCount(reportId, userId, userRole)
  }

  getUnreadCountsByReportIds(reportIds: number[]) {
    return this.commentModel.getUnreadCountsByReportIds(reportIds)
  }

  getCommentCountsByReportIds(reportIds: number[]) {
    return this.commentModel.getCommentCountsByReportIds(reportIds)
  }

  getAllUsers(): Promise<User[]> {
    return this.userModel.findAll()
  }
}

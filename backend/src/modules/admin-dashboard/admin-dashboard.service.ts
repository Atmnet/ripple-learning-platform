import { AdminDashboardRepository } from './admin-dashboard.repository'

const adminDashboardRepository = new AdminDashboardRepository()

export class AdminDashboardService {
  getSnapshot(rangeDays?: number) {
    return adminDashboardRepository.getSnapshot(rangeDays)
  }
}

export const adminDashboardService = new AdminDashboardService()

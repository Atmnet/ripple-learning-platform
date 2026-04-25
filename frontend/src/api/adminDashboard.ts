import api from './index'

export const getAdminDashboard = (params?: { rangeDays?: number }) => api.get('/admin/dashboard', { params })

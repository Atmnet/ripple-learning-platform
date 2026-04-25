import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/app-settings/public']

function resolveRequestPath(url?: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url)
      return parsed.pathname
    } catch {
      return url
    }
  }
  return url
}

function isPublicRequest(url?: string) {
  const path = resolveRequestPath(url)
  return PUBLIC_PATHS.some((item) => path.includes(item))
}

function redirectToLoginIfNeeded() {
  const currentPath = window.location.pathname
  if (currentPath !== '/login' && currentPath !== '/register') {
    window.location.href = '/login'
  }
}

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const publicRequest = isPublicRequest(config.url)

    if (!publicRequest && authStore.isSessionExpired()) {
      authStore.handleSessionExpired('页面停留时间过久，登录已超时，请重新登录')
      redirectToLoginIfNeeded()
      return Promise.reject(new axios.Cancel('session expired'))
    }

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    const authStore = useAuthStore()
    const status = error.response?.status
    const errorMessage = String(error.response?.data?.error || '')
    const requestUrl = error.config?.url
    const publicRequest = isPublicRequest(requestUrl)
    const hasAuthenticatedSession = Boolean(authStore.token && authStore.isAuthenticated)

    if (status === 401) {
      if (!publicRequest && hasAuthenticatedSession) {
        authStore.handleSessionExpired('登录已过期，请重新登录')
        redirectToLoginIfNeeded()
      }
    } else if (status === 403) {
      const looksLikeExpiredAuth =
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('access token') ||
        errorMessage.includes('未登录')

      if (!publicRequest && hasAuthenticatedSession && looksLikeExpiredAuth) {
        authStore.handleSessionExpired('登录状态已失效，请重新登录')
        redirectToLoginIfNeeded()
      } else {
        ElMessage.error('权限不足')
      }
    } else if (status === 404) {
      ElMessage.error('请求的资源不存在')
    } else if (status === 500) {
      ElMessage.error('服务器内部错误')
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时')
    } else if (String(error.message).includes('Network Error')) {
      ElMessage.error('网络连接错误')
    } else {
      ElMessage.error(error.response?.data?.error || '未知错误')
    }

    return Promise.reject(error)
  },
)

export default api

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

interface User {
  id: number
  username: string
  real_name: string
  role: string
}

const LAST_ACTIVITY_KEY = 'auth:lastActivityAt'
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000
let sessionExpiredNoticeShown = false

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = ref(false)

  const markActivity = () => {
    if (!isAuthenticated.value) return
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
  }

  const getLastActivity = () => {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY)
    return raw ? Number(raw) : 0
  }

  const isSessionExpired = () => {
    if (!isAuthenticated.value || !token.value) return false
    const lastActivity = getLastActivity()
    if (!lastActivity) return false
    return Date.now() - lastActivity > SESSION_TIMEOUT_MS
  }

  const setAuth = (userData: User, userToken: string) => {
    user.value = userData
    token.value = userToken
    isAuthenticated.value = true
    localStorage.setItem('token', userToken)
    sessionExpiredNoticeShown = false
    markActivity()
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    localStorage.removeItem(LAST_ACTIVITY_KEY)
  }

  const handleSessionExpired = (message = '登录已过期，请重新登录') => {
    clearAuth()
    if (!sessionExpiredNoticeShown) {
      sessionExpiredNoticeShown = true
      ElMessage.error(message)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    setAuth(response.data.user, response.data.token)
    return response.data
  }

  const register = async (username: string, password: string, real_name: string) => {
    const response = await api.post('/auth/register', { username, password, real_name })
    setAuth(response.data.user, response.data.token)
    return response.data
  }

  const logout = async () => {
    clearAuth()
    sessionExpiredNoticeShown = false
  }

  const getCurrentUser = async () => {
    if (!token.value) return

    const response = await api.get('/auth/me')
    user.value = response.data
    isAuthenticated.value = true
    markActivity()
  }

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      isAuthenticated.value = true

      if (isSessionExpired()) {
        handleSessionExpired('登录已超时，请重新登录')
        return
      }

      try {
        await getCurrentUser()
      } catch {
        clearAuth()
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    clearAuth,
    login,
    register,
    logout,
    getCurrentUser,
    checkAuth,
    markActivity,
    isSessionExpired,
    handleSessionExpired,
  }
})

<template>
  <div class="app-shell">
    <aside class="shell-sidebar">
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          <el-icon><User /></el-icon>
        </div>
        <div class="sidebar-user-copy">
          <div class="sidebar-user-name">{{ authStore.user?.real_name || authStore.user?.username }}</div>
          <div class="sidebar-user-role">{{ isAdminMode ? '管理后台工作台' : '学习工作台' }}</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in visibleNavItems"
          :key="item.key"
          class="sidebar-item"
          :class="{ active: isActive(item.path) }"
          @click="navigate(item.path)"
        >
          <span class="sidebar-icon">
            <el-icon><component :is="item.icon" /></el-icon>
          </span>
          <span class="sidebar-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button
          class="sidebar-item"
          :class="{ active: isActive(portalPath) }"
          @click="navigate(portalPath)"
        >
          <span class="sidebar-icon">
            <el-icon><component :is="portalIcon" /></el-icon>
          </span>
          <span class="sidebar-label">{{ portalLabel }}</span>
        </button>

        <button
          class="sidebar-item sidebar-logout"
          type="button"
          aria-label="退出登录"
          title="退出登录"
          @click="logout"
        >
          <span class="sidebar-icon">
            <el-icon><SwitchButton /></el-icon>
          </span>
          <span class="sidebar-label">退出登录</span>
        </button>
      </div>
    </aside>

    <main class="shell-main">
      <section class="shell-content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChatDotRound,
  Document,
  EditPen,
  Grid,
  House,
  Monitor,
  Reading,
  Setting,
  SwitchButton,
  Trophy,
  User,
  VideoPlay,
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const studentNavItems = [
  { key: 'home', label: '平台首页', icon: House, path: '/' },
  { key: 'reports', label: '日报中心', icon: Document, path: '/daily-reports' },
  { key: 'assignments', label: '作业中心', icon: Reading, path: '/assignments' },
  { key: 'commands', label: '命令学习', icon: Monitor, path: '/learning/commands' },
  { key: 'practice', label: '实战练习', icon: Grid, path: '/learning/practice' },
  { key: 'quiz', label: '测验训练', icon: Trophy, path: '/learning/quiz' },
  { key: 'videos', label: '视频资源', icon: VideoPlay, path: '/videos' },
  { key: 'exams', label: '在线考试', icon: EditPen, path: '/linux-exam' },
  { key: 'mock', label: '模拟面试', icon: ChatDotRound, path: '/mock-interview' },
]

const adminNavItems = [
  { key: 'admin', label: '后台首页', icon: Monitor, path: '/admin' },
  { key: 'users', label: '学员管理', icon: User, path: '/admin/users' },
  { key: 'reports', label: '日报管理', icon: Document, path: '/admin/daily-reports' },
  { key: 'assignments', label: '作业管理', icon: Reading, path: '/admin/assignments' },
  { key: 'exams', label: '考试管理', icon: EditPen, path: '/admin/exams' },
  { key: 'videos', label: '视频资源', icon: VideoPlay, path: '/admin/videos' },
  { key: 'gradebook', label: '成绩中心', icon: Trophy, path: '/admin/gradebook' },
  { key: 'system', label: '系统设置', icon: Setting, path: '/admin/system' },
]

const isAdminMode = computed(() => route.path.startsWith('/admin'))
const visibleNavItems = computed(() => (isAdminMode.value ? adminNavItems : studentNavItems))
const portalPath = computed(() => (isAdminMode.value ? '/' : '/admin'))
const portalLabel = computed(() => (isAdminMode.value ? '回到平台首页' : '管理后台'))
const portalIcon = computed(() => (isAdminMode.value ? House : Setting))

let activityTimer: number | null = null
const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

function navigate(path: string) {
  if (route.path !== path) {
    router.push(path)
  }
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}

function handleActivity() {
  authStore.markActivity()
}

function checkSessionTimeout() {
  if (authStore.isSessionExpired()) {
    authStore.handleSessionExpired('页面停留时间过久，请重新登录')
    router.replace('/login')
  }
}

onMounted(() => {
  authStore.markActivity()
  activityEvents.forEach((eventName) => {
    window.addEventListener(eventName, handleActivity, { passive: true })
  })
  document.addEventListener('visibilitychange', handleActivity)
  activityTimer = window.setInterval(checkSessionTimeout, 60 * 1000)
})

onBeforeUnmount(() => {
  activityEvents.forEach((eventName) => {
    window.removeEventListener(eventName, handleActivity)
  })
  document.removeEventListener('visibilitychange', handleActivity)
  if (activityTimer) {
    window.clearInterval(activityTimer)
    activityTimer = null
  }
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
  background: #f5f6fb;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.shell-sidebar {
  min-height: 100vh;
  padding: 24px 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: linear-gradient(180deg, #6662f1 0%, #9349f5 100%);
  color: #fff;
}

.sidebar-user {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 4px 8px 8px;
}

.sidebar-user-avatar {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 22px;
}

.sidebar-user-name {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  line-height: 1.2;
}

.sidebar-nav,
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-footer {
  margin-top: auto;
}

.sidebar-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.sidebar-item:hover {
  transform: translateX(2px);
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-item.active {
  background: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 18px;
}

.sidebar-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  text-align: left;
}

.shell-main {
  min-width: 0;
}

.shell-content {
  min-height: 100vh;
  padding: 32px 44px 36px;
  background: #f5f6fb;
}

@media (max-width: 1100px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .shell-sidebar {
    min-height: auto;
  }

  .shell-content {
    padding: 20px;
  }
}
</style>

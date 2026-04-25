import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false, title: '登录' },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: false, title: '注册' },
    },
    {
      path: '/',
      component: () => import('../layouts/AppShell.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('../views/Home.vue'),
          meta: { title: '平台首页', shellMode: 'student' },
        },
        {
          path: 'daily-reports',
          name: 'DailyReports',
          component: () => import('../views/DailyReports.vue'),
          meta: { title: '日报中心', shellMode: 'student' },
        },
        {
          path: 'daily-reports/:id',
          name: 'DailyReportDetail',
          component: () => import('../views/DailyReportDetail.vue'),
          meta: { title: '日报详情', shellMode: 'student' },
        },
        {
          path: 'assignments',
          name: 'Assignments',
          component: () => import('../views/Assignments.vue'),
          meta: { title: '作业中心', shellMode: 'student' },
        },
        {
          path: 'assignments/create',
          redirect: '/admin/assignments/create',
          meta: { requiresAdmin: true },
        },
        {
          path: 'assignments/:id',
          name: 'AssignmentDetail',
          component: () => import('../views/AssignmentDetail.vue'),
          meta: { title: '作业详情', shellMode: 'student' },
        },
        {
          path: 'assignments/:id/edit',
          redirect: (to) => `/admin/assignments/${to.params.id}/edit`,
          meta: { requiresAdmin: true },
        },
        {
          path: 'gradebook',
          redirect: '/admin/gradebook',
          meta: { requiresAdmin: true },
        },
        {
          path: 'videos',
          name: 'VideoResources',
          component: () => import('../views/VideoResources.vue'),
          meta: { title: '视频资源', shellMode: 'student' },
        },
        {
          path: 'documents',
          redirect: '/videos',
          meta: { requiresAuth: true },
        },
        {
          path: 'mock-interview',
          name: 'MockInterview',
          component: () => import('../views/MockInterview.vue'),
          meta: { title: '模拟面试', shellMode: 'student' },
        },
        {
          path: 'admin',
          name: 'Admin',
          component: () => import('../views/Admin.vue'),
          meta: { title: '管理后台', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/daily-reports',
          name: 'DailyReportsAdmin',
          component: () => import('../views/DailyReportsAdmin.vue'),
          meta: { title: '日报管理', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/daily-reports/:id',
          name: 'DailyReportDetailAdmin',
          component: () => import('../views/DailyReportDetail.vue'),
          meta: { title: '日报详情', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/users',
          name: 'UserManagement',
          component: () => import('../views/UserManagement.vue'),
          meta: { title: '学员管理', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/assignments',
          name: 'AssignmentsAdmin',
          component: () => import('../views/Assignments.vue'),
          meta: { title: '作业管理', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/assignments/create',
          name: 'AssignmentCreateAdmin',
          component: () => import('../views/AssignmentCreate.vue'),
          meta: { title: '创建作业', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/assignments/:id',
          name: 'AssignmentDetailAdmin',
          component: () => import('../views/AssignmentDetail.vue'),
          meta: { title: '作业详情', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/assignments/:id/edit',
          name: 'AssignmentEditAdmin',
          component: () => import('../views/AssignmentEdit.vue'),
          meta: { title: '编辑作业', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/gradebook',
          name: 'GradebookAdmin',
          component: () => import('../views/Gradebook.vue'),
          meta: { title: '成绩中心', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/system',
          name: 'SystemSettings',
          component: () => import('../views/SystemSettings.vue'),
          meta: { title: '系统设置', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/mock-interviews',
          name: 'MockInterviewAdmin',
          component: () => import('../views/MockInterviewAdmin.vue'),
          meta: { title: '模拟面试管理', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/videos',
          name: 'VideoResourceManage',
          component: () => import('../views/VideoResourceManage.vue'),
          meta: { title: '视频资源管理', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'linux-learning',
          redirect: '/learning/commands',
          meta: { title: '知识学习', shellMode: 'student' },
        },
        {
          path: 'learning',
          redirect: '/learning/commands',
          meta: { title: '知识学习', shellMode: 'student' },
        },
        {
          path: 'learning/commands',
          name: 'CommandLearning',
          component: () => import('../views/linux/CommandLearn.vue'),
          meta: { title: '命令学习', shellMode: 'student' },
        },
        {
          path: 'learning/practice',
          name: 'PracticeLearning',
          component: () => import('../views/linux/PracticeScenario.vue'),
          meta: { title: '实战练习', shellMode: 'student' },
        },
        {
          path: 'learning/quiz',
          name: 'QuizLearning',
          component: () => import('../views/linux/Quiz.vue'),
          meta: { title: '测验训练', shellMode: 'student' },
        },
        {
          path: 'linux-exam',
          name: 'LinuxExamList',
          component: () => import('../views/linux/ExamList.vue'),
          meta: { title: '在线考试', shellMode: 'student' },
        },
        {
          path: 'linux-exam/taking',
          name: 'LinuxExamTaking',
          component: () => import('../views/linux/ExamTaking.vue'),
          meta: { title: '考试作答', shellMode: 'student' },
        },
        {
          path: 'admin/exams',
          name: 'LinuxExamManage',
          component: () => import('../views/linux/teacher/ExamManage.vue'),
          meta: { title: '考试管理', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/exams/create',
          name: 'LinuxExamCreate',
          component: () => import('../views/linux/teacher/ExamCreate.vue'),
          meta: { title: '创建考试', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'admin/exams/edit/:id',
          name: 'LinuxExamEdit',
          component: () => import('../views/linux/teacher/ExamCreate.vue'),
          meta: { title: '编辑考试', shellMode: 'admin', requiresAdmin: true },
        },
        {
          path: 'linux-exam/manage',
          redirect: '/admin/exams',
          meta: { requiresAdmin: true },
        },
        {
          path: 'linux-exam/create',
          redirect: '/admin/exams/create',
          meta: { requiresAdmin: true },
        },
        {
          path: 'linux-exam/edit/:id',
          redirect: (to) => `/admin/exams/edit/${to.params.id}`,
          meta: { requiresAdmin: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth()
      if (!authStore.isAuthenticated) {
        next('/login')
        return
      }
    }

    if (requiresAdmin && authStore.user?.role !== 'admin') {
      next('/')
      return
    }
  }

  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router

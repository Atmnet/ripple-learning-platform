<template>
  <div class="home-shell">
    <main class="home-container">
      <section class="page-heading">
        <h1>平台首页</h1>
        <p>把今天要处理的日报、作业、考试和学习入口收进同一块工作台里。</p>
      </section>

      <section class="module-grid">
        <article class="module-card" :title="hasTodayReport ? '今日日报：已提交' : '今日日报：待提交'" @click="handleDailyClick">
          <div class="module-icon daily">
            <el-badge v-if="todayUnreadComments > 0" :value="todayUnreadComments" class="module-badge">
              <el-icon><Document /></el-icon>
            </el-badge>
            <el-icon v-else><Document /></el-icon>
          </div>
          <div class="module-copy">
            <h3>今日日报</h3>
            <p>{{ hasTodayReport ? '已提交并可查看反馈' : '待完成今日学习总结' }}</p>
          </div>
        </article>

        <article class="module-card" :title="assignmentCardStatusText" @click="showTodayAssignments">
          <div class="module-icon assignment">
            <el-icon :style="{ color: assignmentCardIconColor }"><Reading /></el-icon>
          </div>
          <div class="module-copy">
            <h3>今日作业</h3>
            <p>{{ assignmentCardStatusText }}</p>
          </div>
        </article>

        <article class="module-card" :title="examCardStatusText" @click="handleExamClick">
          <div class="module-icon exam">
            <el-badge v-if="activeExamCount > 0" :value="activeExamCount" class="module-badge">
              <el-icon><EditPen /></el-icon>
            </el-badge>
            <el-badge v-else-if="publishedExamCount > 0" :value="publishedExamCount" class="module-badge">
              <el-icon><EditPen /></el-icon>
            </el-badge>
            <el-icon v-else><EditPen /></el-icon>
          </div>
          <div class="module-copy">
            <h3>在线考试</h3>
            <p>{{ examCardStatusText }}</p>
          </div>
        </article>

        <article class="module-card" title="知识学习" @click="goToLinuxLearning">
          <div class="module-icon learning">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="module-copy">
            <h3>知识学习</h3>
            <p>命令学习与知识梳理</p>
          </div>
        </article>

        <article class="module-card" :title="`视频资源：${totalVideos} 个视频`" @click="router.push('/videos')">
          <div class="module-icon video">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="module-copy">
            <h3>视频资源</h3>
            <p>{{ totalVideos }} 个资源可查看</p>
          </div>
        </article>

        <article class="module-card" title="模拟面试" @click="router.push('/mock-interview')">
          <div class="module-icon mock">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="module-copy">
            <h3>模拟面试</h3>
            <p>开始岗位训练与复盘</p>
          </div>
        </article>
      </section>

      <section class="bottom-grid">
        <div class="panel-card reminder-panel">
          <div class="panel-title">学习提醒</div>
          <div class="reminder-list">
            <div v-for="item in learningReminders" :key="item.title" class="reminder-item">
              <span class="reminder-dot" :class="item.type"></span>
              <div class="reminder-copy">
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card metrics-panel">
          <div class="panel-head">
            <div class="panel-title">学习数据概览</div>
            <el-segmented
              v-model="activityRange"
              :options="activityRangeOptions"
              size="small"
              class="range-switch"
            />
          </div>

          <div class="metrics-grid">
            <div class="metric-box reports">
              <span>提交日报</span>
              <strong>{{ activitySummary.reportCount }}</strong>
            </div>
            <div class="metric-box assignments">
              <span>提交作业</span>
              <strong>{{ activitySummary.assignmentCount }}</strong>
            </div>
            <div class="metric-box activity">
              <span>活跃度</span>
              <strong>{{ activitySummary.activityScore }}</strong>
            </div>
          </div>

          <div class="chart-card">
            <svg viewBox="0 0 420 176" class="activity-chart" preserveAspectRatio="none">
              <defs>
                <linearGradient id="activityArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(108, 99, 255, 0.22)" />
                  <stop offset="100%" stop-color="rgba(108, 99, 255, 0)" />
                </linearGradient>
              </defs>
              <g class="chart-grid">
                <line v-for="y in [24, 68, 112, 156]" :key="y" x1="10" :y1="y" x2="410" :y2="y" />
              </g>
              <path class="chart-area" :d="activityAreaPath" />
              <polyline class="chart-line secondary" :points="reportLinePoints" />
              <polyline class="chart-line tertiary" :points="assignmentLinePoints" />
              <polyline class="chart-line primary" :points="activityLinePoints" />
              <g class="chart-points">
                <circle
                  v-for="point in activityPoints"
                  :key="`activity-${point.x}`"
                  :cx="point.x"
                  :cy="point.y"
                  r="3.6"
                />
              </g>
            </svg>
            <div class="chart-axis">
              <span v-for="item in activitySeries" :key="item.label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <el-dialog
      v-model="dailyDialogVisible"
      :title="todayReport ? '今日日报（已提交）' : '提交今日日报'"
      width="620px"
      destroy-on-close
      :lock-scroll="false"
    >
      <div v-if="todayReport" class="submitted-panel">
        <el-alert type="success" :closable="false" show-icon>
          <template #title>您已于 {{ formatDateTime(todayReport.created_at) }} 提交日报</template>
        </el-alert>
        <div class="report-box">
          <div class="report-label">日报内容</div>
          <div class="report-text">{{ todayReport.content }}</div>
        </div>
      </div>

      <el-form v-else ref="dailyFormRef" :model="dailyForm" :rules="dailyRules" label-width="72px">
        <el-form-item label="日期">
          <el-date-picker v-model="dailyForm.date" type="date" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="dailyForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入今天的学习内容、进展和心得"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dailyDialogVisible = false">关闭</el-button>
        <el-button v-if="todayReport" type="danger" :loading="withdrawingDaily" @click="withdrawDaily">
          撤回日报
        </el-button>
        <el-button v-else type="primary" :loading="submittingDaily" @click="submitDaily">
          提交日报
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignmentDialogVisible" title="今日作业" width="720px" destroy-on-close :lock-scroll="false">
      <div v-if="todayAssignments.length > 0" class="assignment-list">
        <el-card v-for="assignment in todayAssignments" :key="assignment.id" class="assignment-item" shadow="hover">
          <template #header>
            <div class="assignment-header">
              <span class="assignment-title">{{ assignment.title }}</span>
              <el-tag :type="getDeadlineType(assignment.deadline)">
                {{ formatDeadline(assignment.deadline) }}
              </el-tag>
            </div>
          </template>
          <div class="assignment-desc">{{ assignment.description || '暂无描述' }}</div>
          <div class="assignment-actions">
            <el-button
              :type="isAdminRole ? 'info' : assignment.hasSubmitted ? 'success' : 'primary'"
              :disabled="!isAdminRole && assignment.hasSubmitted"
              @click="isAdminRole ? router.push(`/admin/assignments/${assignment.id}`) : openSubmitDialog(assignment)"
            >
              {{ isAdminRole ? '查看详情' : assignment.hasSubmitted ? '已提交' : '提交作业' }}
            </el-button>
            <el-button v-if="assignment.file_url" link type="primary" @click="openFile(assignment.file_url)">
              下载附件
            </el-button>
          </div>
        </el-card>
      </div>
      <el-empty v-else description="今日作业为空" />
    </el-dialog>

    <el-dialog v-model="submitDialogVisible" title="提交作业" width="620px" destroy-on-close :lock-scroll="false">
      <div v-if="currentAssignment" class="submit-info">
        <p><strong>作业：</strong>{{ currentAssignment.title }}</p>
        <p><strong>截止日期：</strong>{{ formatDate(currentAssignment.deadline) }}</p>
      </div>

      <el-form :model="submitForm" label-width="72px">
        <el-form-item label="文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="ASSIGNMENT_MAX_FILE_COUNT"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-exceed="handleExceed"
            :file-list="fileList"
            action="#"
            multiple
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">
                支持文档、图片、压缩包等格式，单个文件不超过 {{ ASSIGNMENT_MAX_FILE_SIZE_MB }}MB，最多上传
                {{ ASSIGNMENT_MAX_FILE_COUNT }} 个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="留言">
          <el-input v-model="submitForm.comment" type="textarea" :rows="4" placeholder="请输入备注或提交说明" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="submitDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingAssignment" @click="submitAssignment">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FormInstance, FormRules, UploadUserFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, Document, EditPen, Monitor, Reading, UploadFilled, VideoPlay } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { ASSIGNMENT_ALLOWED_FILE_TYPES, ASSIGNMENT_MAX_FILE_COUNT, ASSIGNMENT_MAX_FILE_SIZE_MB } from '../constants/fileUpload'
import { useAuthStore } from '../stores/auth'
import { normalizeListPayload } from '../utils/apiResponse'
import { formatDateTimeText, parseDateTimeForCompare } from '../utils/dateTime'

interface DailyReportRecord {
  id: number
  content: string
  created_at: string
  reviewed_at?: string | null
}

interface AssignmentItem {
  id: number
  title: string
  description?: string
  deadline: string
  file_url?: string
  hasSubmitted?: boolean
}

interface ActivityPoint {
  label: string
  reportCount: number
  assignmentCount: number
  activityScore: number
}

const router = useRouter()
const authStore = useAuthStore()
const dailyFormRef = ref<FormInstance>()
const uploadRef = ref()

const dailyDialogVisible = ref(false)
const assignmentDialogVisible = ref(false)
const submitDialogVisible = ref(false)
const submittingDaily = ref(false)
const withdrawingDaily = ref(false)
const submittingAssignment = ref(false)

const todayReport = ref<DailyReportRecord | null>(null)
const hasTodayReport = ref(false)
const todayUnreadComments = ref(0)
const todayIsReviewed = ref(false)
const todayAssignments = ref<AssignmentItem[]>([])
const mySubmissionAssignmentIds = ref<number[]>([])
const totalVideos = ref(0)
const publishedExamCount = ref(0)
const activeExamCount = ref(0)
const activityRange = ref('7')
const activityRangeOptions = [
  { label: '7天', value: '7' },
  { label: '15天', value: '15' },
  { label: '30天', value: '30' },
]
const studentReportHistory = ref<any[]>([])
const studentAssignmentHistory = ref<any[]>([])
const studentExamHistory = ref<any[]>([])

const currentAssignment = ref<AssignmentItem | null>(null)
const fileList = ref<UploadUserFile[]>([])

const dailyForm = ref({
  date: new Date(),
  content: '',
})

const submitForm = ref({
  comment: '',
})

const isAdminRole = computed(() => authStore.user?.role === 'admin')


const dailyRules: FormRules = {
  content: [
    { required: true, message: '请输入日报内容', trigger: 'blur' },
    { min: 5, message: '日报内容至少 5 个字', trigger: 'blur' },
  ],
}

const todayAssignmentsSubmitted = computed(() => {
  if (todayAssignments.value.length === 0) return false
  return todayAssignments.value.every((item) => item.hasSubmitted)
})

const assignmentCardStatusText = computed(() => {
  if (todayAssignments.value.length === 0) {
    return isAdminRole.value ? '当前没有未截止作业' : '当前没有待处理作业'
  }

  if (isAdminRole.value) {
    return `当前有 ${todayAssignments.value.length} 份未截止作业`
  }

  if (todayAssignmentsSubmitted.value) {
    return '当前作业已全部提交'
  }

  const pendingCount = todayAssignments.value.filter((item) => !item.hasSubmitted).length
  return `还有 ${pendingCount} 份作业待提交`
})

const examCardStatusText = computed(() => {
  if (activeExamCount.value > 0) {
    return `当前有 ${activeExamCount.value} 场考试进行中`
  }

  if (publishedExamCount.value > 0) {
    return `有 ${publishedExamCount.value} 场考试待参加`
  }

  return '当前没有待参加考试'
})


const assignmentCardIconColor = computed(() => {
  if (isAdminRole.value) {
    return todayAssignments.value.length > 0 ? '#4f7cff' : '#94a3b8'
  }
  return todayAssignmentsSubmitted.value ? '#1f9d66' : todayAssignments.value.length > 0 ? '#4f7cff' : '#94a3b8'
})



const learningReminders = computed(() => {
  const reminders: Array<{ title: string; description: string; type: string }> = []

  if (!hasTodayReport.value) {
    reminders.push({
      title: '今日日报尚未完成',
      description: '建议先提交今天的学习总结和进展。',
      type: 'warning',
    })
  }

  if (!isAdminRole.value && todayAssignments.value.length > 0 && !todayAssignmentsSubmitted.value) {
    reminders.push({
      title: '今日还有作业待提交',
      description: `还有 ${todayAssignments.value.filter((item) => !item.hasSubmitted).length} 份作业等待处理。`,
      type: 'danger',
    })
  }

  if (publishedExamCount.value > 0) {
    reminders.push({
      title: '考试安排需要关注',
      description: activeExamCount.value > 0 ? '当前有考试已经开始。' : '已有考试发布，建议及时查看。',
      type: activeExamCount.value > 0 ? 'danger' : 'warning',
    })
  }

  reminders.push({
    title: '继续知识学习',
    description: '命令学习、实战练习和测验训练都可以从首页快速进入。',
    type: 'success',
  })

  return reminders
})


function createDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createDayLabel(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

function isWithinRange(value: string | undefined, days: number) {
  if (!value) return false
  const date = parseDateTimeForCompare(value)
  if (!date) return false
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - days + 1)
  return date >= start && date <= now
}

const activitySeries = computed<ActivityPoint[]>(() => {
  const days = Number(activityRange.value)
  const today = new Date()
  const buckets = new Map<string, ActivityPoint>()

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(today.getDate() - index)
    const key = createDateKey(date)
    buckets.set(key, {
      label: createDayLabel(date),
      reportCount: 0,
      assignmentCount: 0,
      activityScore: 0,
    })
  }

  studentReportHistory.value.forEach((item) => {
    const value = item.submit_date || item.created_at
    const date = parseDateTimeForCompare(value)
    if (!date) return
    const key = createDateKey(date)
    const bucket = buckets.get(key)
    if (bucket) bucket.reportCount += 1
  })

  studentAssignmentHistory.value.forEach((item) => {
    const date = parseDateTimeForCompare(item.submitted_at)
    if (!date) return
    const key = createDateKey(date)
    const bucket = buckets.get(key)
    if (bucket) bucket.assignmentCount += 1
  })

  studentExamHistory.value.forEach((item) => {
    const value = item.endTime || item.end_time || item.startTime || item.start_time
    const date = parseDateTimeForCompare(value)
    if (!date) return
    const key = createDateKey(date)
    const bucket = buckets.get(key)
    if (bucket) {
      const score = Number(item.score || 0)
      bucket.activityScore += Math.min(45, score > 0 ? Math.max(20, Math.round(score * 0.45)) : 18)
    }
  })

  return Array.from(buckets.values()).map((item) => ({
    ...item,
    activityScore: Math.min(100, item.activityScore + item.reportCount * 22 + item.assignmentCount * 30),
  }))
})

const activitySummary = computed(() => {
  const days = Number(activityRange.value)
  const reportCount = studentReportHistory.value.filter((item) => isWithinRange(item.submit_date || item.created_at, days)).length
  const assignmentCount = studentAssignmentHistory.value.filter((item) => isWithinRange(item.submitted_at, days)).length
  const avgScore = activitySeries.value.length
    ? Math.round(activitySeries.value.reduce((sum, item) => sum + item.activityScore, 0) / activitySeries.value.length)
    : 0

  let activityLevel = '保持节奏'
  if (avgScore >= 80) activityLevel = '非常活跃'
  else if (avgScore >= 60) activityLevel = '持续活跃'
  else if (avgScore >= 35) activityLevel = '稳步学习'

  return {
    reportCount,
    assignmentCount,
    activityScore: avgScore,
    activityLevel,
  }
})

function buildLinePoints(values: number[], maxValue: number) {
  if (!values.length) return ''
  const usableWidth = 380
  const baseX = 20
  const baseY = 156
  const chartHeight = 120
  const step = values.length > 1 ? usableWidth / (values.length - 1) : 0

  return values
    .map((value, index) => {
      const ratio = maxValue > 0 ? value / maxValue : 0
      const x = baseX + step * index
      const y = baseY - ratio * chartHeight
      return `${x},${y}`
    })
    .join(' ')
}

const activityMax = computed(() => {
  const values = activitySeries.value.flatMap((item) => [item.activityScore, item.reportCount, item.assignmentCount])
  return Math.max(1, ...values)
})

const activityLinePoints = computed(() =>
  buildLinePoints(activitySeries.value.map((item) => item.activityScore), activityMax.value),
)

const reportLinePoints = computed(() =>
  buildLinePoints(activitySeries.value.map((item) => item.reportCount), activityMax.value),
)

const assignmentLinePoints = computed(() =>
  buildLinePoints(activitySeries.value.map((item) => item.assignmentCount), activityMax.value),
)

const activityAreaPath = computed(() => {
  if (!activityLinePoints.value) return ''
  const first = activityLinePoints.value.split(' ')[0]
  const last = activityLinePoints.value.split(' ').at(-1)
  if (!first || !last) return ''
  const [firstX] = first.split(',')
  const [lastX] = last.split(',')
  return `M ${firstX},156 L ${activityLinePoints.value.replace(/,/g, ' ')} L ${lastX} 156 Z`
})

const activityPoints = computed(() => {
  const pointText = activityLinePoints.value
  if (!pointText) return []
  return pointText.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number)
    return { x, y }
  })
})

function isAllowedFile(file: File) {
  const isAllowed = ASSIGNMENT_ALLOWED_FILE_TYPES.includes(file.type as never) || file.type === ''
  if (!isAllowed) {
    ElMessage.error('不支持的文件类型，请上传文档、图片或压缩包')
    return false
  }

  const isLtSize = file.size / 1024 / 1024 < ASSIGNMENT_MAX_FILE_SIZE_MB
  if (!isLtSize) {
    ElMessage.error(`单个文件不能超过 ${ASSIGNMENT_MAX_FILE_SIZE_MB}MB`)
    return false
  }

  return true
}

function markAssignmentSubmitted(assignmentId: number) {
  if (!mySubmissionAssignmentIds.value.includes(assignmentId)) {
    mySubmissionAssignmentIds.value.push(assignmentId)
  }
  todayAssignments.value = todayAssignments.value.map((item) =>
    item.id === assignmentId ? { ...item, hasSubmitted: true } : item
  )
}

async function handleCommand(command: string) {
  if (command === 'logout') {
    await authStore.logout()
    router.push('/login')
  }
}

function handleDailyClick() {
  dailyDialogVisible.value = true
}

function showTodayAssignments() {
  assignmentDialogVisible.value = true
}

function handleExamClick() {
  router.push('/linux-exam')
}

function goToLinuxLearning() {
  router.push('/learning/commands')
}

async function submitDaily() {
  if (!dailyFormRef.value) return

  try {
    await dailyFormRef.value.validate()
  } catch {
    return
  }

  submittingDaily.value = true
  try {
    await api.post('/daily-reports', {
      content: dailyForm.value.content,
      submit_date: formatDateForSubmit(dailyForm.value.date),
    })
    ElMessage.success('日报提交成功')
    dailyDialogVisible.value = false
    dailyForm.value.content = ''
    await loadDashboard()
  } catch {
    // axios 拦截器统一处理提示
  } finally {
    submittingDaily.value = false
  }
}

async function withdrawDaily() {
  if (!todayReport.value) return

  try {
    await ElMessageBox.confirm('撤回后今天的日报状态将恢复为待提交，是否继续？', '撤回日报', {
      type: 'warning',
    })
  } catch {
    return
  }

  withdrawingDaily.value = true
  try {
    await api.delete(`/daily-reports/${todayReport.value.id}`)
    ElMessage.success('日报已撤回')
    dailyDialogVisible.value = false
    await loadDashboard()
  } catch {
    // axios 拦截器统一处理提示
  } finally {
    withdrawingDaily.value = false
  }
}

function openSubmitDialog(assignment: AssignmentItem) {
  if (assignment.hasSubmitted) return
  currentAssignment.value = assignment
  submitForm.value.comment = ''
  fileList.value = []
  submitDialogVisible.value = true
}

function handleFileChange(file: UploadUserFile, files: UploadUserFile[]) {
  const raw = file.raw as File | undefined
  if (raw && !isAllowedFile(raw)) {
    fileList.value = files.filter((item) => item.uid !== file.uid)
    return
  }
  fileList.value = files
}

function handleFileRemove(_file: UploadUserFile, files: UploadUserFile[]) {
  fileList.value = files
}

function handleExceed() {
  ElMessage.warning(`最多只能上传 ${ASSIGNMENT_MAX_FILE_COUNT} 个文件`)
}

async function submitAssignment() {
  if (!currentAssignment.value) return
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  submittingAssignment.value = true
  try {
    const uploadedUrls: string[] = []

    for (const item of fileList.value) {
      if (!item.raw) continue
      const formData = new FormData()
      formData.append('file', item.raw)
      const response = await api.post('/upload', formData)
      const uploadedUrl = response.data?.url || response.data?.data?.url
      if (!uploadedUrl) {
        throw new Error('Upload url missing')
      }
      uploadedUrls.push(uploadedUrl)
    }

    const response = await api.post(`/assignments/${currentAssignment.value.id}/submit`, {
      file_urls: uploadedUrls,
      comment: submitForm.value.comment,
    })

    ElMessage.success('作业提交成功')
    markAssignmentSubmitted(currentAssignment.value.id)
    submitDialogVisible.value = false
    fileList.value = []
    uploadRef.value?.clearFiles?.()

    if (response.data?.data?.assignment_id) {
      markAssignmentSubmitted(Number(response.data.data.assignment_id))
    }
  } catch (error: any) {
    if (error.response?.status === 409 && currentAssignment.value) {
      markAssignmentSubmitted(currentAssignment.value.id)
      submitDialogVisible.value = false
      ElMessage.success('作业已提交，状态已同步')
      return
    }
  } finally {
    submittingAssignment.value = false
  }
}

function openFile(url: string) {
  window.open(url, '_blank')
}

function getDeadlineType(deadline: string) {
  const target = parseDateTimeForCompare(deadline)
  if (!target) return 'info'
  return target.getTime() < Date.now() ? 'danger' : 'warning'
}

function formatDeadline(deadline: string) {
  const target = parseDateTimeForCompare(deadline)
  if (!target) return '截止时间待定'
  return target.getTime() < Date.now() ? '已截止' : `截止 ${formatDateTimeText(deadline)}`
}

function formatDate(value: string) {
  return formatDateTimeText(value).split(' ')[0] || '-'
}

function formatDateTime(value: string) {
  return formatDateTimeText(value)
}

function formatDateForSubmit(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function loadDashboard() {
  const today = new Date()
  dailyForm.value.date = today
  dailyForm.value.content = ''

  try {
    const [dailyStatusRes, assignmentsRes, mySubmissionsRes, examsRes] = await Promise.all([
      api.get('/daily-reports/today-status'),
      api.get('/assignments?page=1&limit=100'),
      api.get('/assignments/my-submissions'),
      api.get('/linux-exam/exams/published'),
    ])

    const dailyStatus = dailyStatusRes.data || {}
    hasTodayReport.value = Boolean(dailyStatus.has_submitted)
    todayReport.value = (dailyStatus.report as DailyReportRecord | null) || null
    todayUnreadComments.value = Number(dailyStatus.unread_comments || 0)
    todayIsReviewed.value = Boolean(dailyStatus.is_reviewed || dailyStatus.reviewed_at)

    const assignmentPayload = normalizeListPayload<AssignmentItem>(assignmentsRes.data)
    const now = new Date()
    const activeAssignments = assignmentPayload.data
      .filter((item) => {
      const deadline = parseDateTimeForCompare(item.deadline)
      if (!deadline) return false
        return deadline.getTime() >= now.getTime()
      })
      .sort((left, right) => {
        const leftDeadline = parseDateTimeForCompare(left.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER
        const rightDeadline = parseDateTimeForCompare(right.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER
        return leftDeadline - rightDeadline
      })
      .slice(0, 8)

    const mySubmissionsPayload = normalizeListPayload<any>(mySubmissionsRes.data)
    studentAssignmentHistory.value = mySubmissionsPayload.data
    mySubmissionAssignmentIds.value = mySubmissionsPayload.data
      .map((item) => Number(item.assignment_id ?? item.assignmentId))
      .filter((item) => !Number.isNaN(item))

    todayAssignments.value = activeAssignments.map((item) => ({
      ...item,
      hasSubmitted: mySubmissionAssignmentIds.value.includes(Number(item.id)),
    }))

    const exams = examsRes.data?.data || []
    const visiblePublished = exams.filter((exam: any) => exam.status === 'published' && !exam.hasCompleted)
    publishedExamCount.value = visiblePublished.length
    activeExamCount.value = visiblePublished.filter((exam: any) => exam.canStart).length

  } catch (error) {
    console.error('加载仪表盘数据失败', error)
  }
}

async function loadDeferredDashboardInsights() {
  try {
    const [videosRes, dailyHistoryRes, examHistoryRes] = await Promise.all([
      api.get('/videos'),
      api.get('/daily-reports?page=1&limit=100'),
      api.get('/linux-exam/student-exams'),
    ])

    const videoPayload = normalizeListPayload<any>(videosRes.data)
    totalVideos.value = videoPayload.total

    const dailyHistoryPayload = normalizeListPayload<any>(dailyHistoryRes.data)
    studentReportHistory.value = dailyHistoryPayload.data

    studentExamHistory.value = Array.isArray(examHistoryRes.data?.data) ? examHistoryRes.data.data : []
  } catch (error) {
    console.error('加载首页延后数据失败', error)
  }
}

onMounted(() => {
  loadDashboard().finally(() => {
    window.requestAnimationFrame(() => {
      loadDeferredDashboardInsights()
    })
  })
})
</script>

<style scoped>
.home-shell {
  min-height: 100%;
  background: transparent;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.home-container {
  display: flex;
  flex-direction: column;
  gap: 34px;
}

.page-heading h1 {
  margin: 0;
  color: #6461f3;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.page-heading p {
  margin: 10px 0 0;
  color: #627089;
  font-size: 13px;
  line-height: 1.65;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px 24px;
}

.module-card {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 116px;
  padding: 24px;
  background: #fff;
  border: 1px solid #eef0f7;
  border-radius: 28px;
  box-shadow: 0 12px 28px rgba(116, 122, 141, 0.08);
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(116, 122, 141, 0.12);
}

.module-icon {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  background: #f7f8fc;
  color: #7c5cff;
  font-size: 26px;
  flex-shrink: 0;
}

.module-icon.assignment { color: #e7007b; }
.module-icon.exam { color: #ff5b00; }
.module-icon.learning { color: #1493e8; }
.module-icon.video { color: #f01452; }
.module-icon.mock { color: #0093c9; }

.module-copy h3 {
  margin: 0;
  color: #20283a;
  font-size: 18px;
  font-weight: 800;
}

.module-copy p {
  margin: 8px 0 0;
  color: #7a8498;
  font-size: 13px;
  line-height: 1.5;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.panel-card {
  background: #fff;
  border: 1px solid #eef0f7;
  border-radius: 32px;
  box-shadow: 0 12px 28px rgba(116, 122, 141, 0.08);
  padding: 30px 34px;
}

.panel-title {
  color: #20283a;
  font-size: 18px;
  font-weight: 800;
}

.reminder-list {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.reminder-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 18px;
  background: #f7f8fc;
  border-radius: 24px;
}

.reminder-dot {
  width: 14px;
  height: 14px;
  margin-top: 4px;
  border-radius: 50%;
  background: #8d8d8d;
  flex-shrink: 0;
}

.reminder-dot.warning { background: #9f49ff; }
.reminder-dot.danger { background: #ff5b00; }
.reminder-dot.success { background: #1da1f2; }

.reminder-copy strong {
  display: block;
  color: #20283a;
  font-size: 16px;
  font-weight: 800;
}

.reminder-copy p {
  margin: 8px 0 0;
  color: #7a8498;
  font-size: 14px;
  line-height: 1.55;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.metrics-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.metric-box {
  border-radius: 22px;
  background: #f7f8fc;
  padding: 20px 16px;
  text-align: center;
}

.metric-box span {
  display: block;
  color: #8b93a7;
  font-size: 12px;
  font-weight: 700;
}

.metric-box strong {
  display: block;
  margin-top: 12px;
  font-size: 38px;
  line-height: 1;
  font-weight: 800;
}

.metric-box.reports strong { color: #8b22ff; }
.metric-box.assignments strong { color: #f0147a; }
.metric-box.activity strong { color: #06a26e; }

.chart-card {
  margin-top: 22px;
  padding: 16px 18px 10px;
  border-radius: 24px;
  background: #f8f9fd;
}

.activity-chart {
  width: 100%;
  height: 176px;
  display: block;
}

.chart-grid line {
  stroke: rgba(210, 216, 230, 0.9);
  stroke-width: 1;
}

.chart-area {
  fill: url(#activityArea);
}

.chart-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.chart-line.primary { stroke: #6c63ff; }
.chart-line.secondary { stroke: #8b22ff; stroke-width: 2.4; }
.chart-line.tertiary { stroke: #06a26e; stroke-width: 2.4; }

.chart-points circle {
  fill: #fff;
  stroke: #6c63ff;
  stroke-width: 2;
}

.chart-axis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
  color: #7f889d;
  font-size: 11px;
}

.module-badge :deep(.el-badge__content) {
  border: none;
  box-shadow: 0 0 0 3px #f7f8fc;
}

.assignment-item {
  border-radius: 24px;
  border: 1px solid #eef0f7;
  box-shadow: 0 10px 24px rgba(116, 122, 141, 0.08);
}

.assignment-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assignment-title {
  color: #20283a;
  font-size: 16px;
  font-weight: 800;
}

.assignment-desc {
  color: #7a8498;
  line-height: 1.75;
}

.assignment-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.submitted-panel,
.submit-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.report-box {
  padding: 18px;
  border-radius: 18px;
  background: #f7f8fc;
}

.report-label {
  color: #5f738e;
  font-size: 13px;
  font-weight: 700;
}

.report-text {
  margin-top: 10px;
  color: #20283a;
  line-height: 1.8;
  white-space: pre-wrap;
}

:deep(.el-dialog) {
  border-radius: 28px;
}

@media (max-width: 1280px) {
  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-heading h1 {
    font-size: 20px;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>

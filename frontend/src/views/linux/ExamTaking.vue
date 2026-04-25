<template>
  <div class="exam-taking">
    <!-- 顶部导航栏 -->
    <div class="exam-header">
      <div class="header-left">
        <h2>{{ examTitle }}</h2>
        <span class="exam-info">题目 {{ currentIndex + 1 }} / {{ questions.length }}</span>
      </div>
      <div class="header-center">
        <div class="timer" :class="{ 'warning': remainingTime <= 300, 'danger': remainingTime <= 60 }">
          <el-icon><Timer /></el-icon>
          <span>{{ formatTime(remainingTime) }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button size="large" @click="exitExam">
          退出考试
        </el-button>
        <el-button type="primary" size="large" @click="submitExam" :loading="submitting">
          提交试卷
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="exam-content">
      <!-- 左侧题目区域 -->
      <div class="question-area">
        <el-card v-if="currentQuestion" class="question-card">
          <div class="question-header">
            <span class="question-number">第 {{ currentIndex + 1 }} 题</span>
            <el-tag :type="getQuestionTypeColor(currentQuestion.type)">
              {{ getQuestionTypeLabel(currentQuestion.type) }}
            </el-tag>
            <el-tag type="info" style="margin-left: 8px;">
              {{ getCategoryName(currentQuestion.category) }}
            </el-tag>
          </div>

          <div class="question-content">
            <p class="question-text">{{ currentQuestion.question }}</p>

            <!-- 选择题 -->
            <template v-if="currentQuestion.type === 'choice'">
              <el-radio-group v-model="answers[currentQuestion.id]" class="choice-options">
                <el-radio
                  v-for="(option, idx) in currentQuestion.options"
                  :key="idx"
                  :label="idx"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + idx) }}.</span>
                  <span class="option-text">{{ option }}</span>
                </el-radio>
              </el-radio-group>
            </template>

            <!-- 判断题 -->
            <template v-else-if="currentQuestion.type === 'truefalse'">
              <el-radio-group v-model="answers[currentQuestion.id]" class="choice-options">
                <el-radio :label="true" class="option-item">
                  <span class="option-label">正确</span>
                </el-radio>
                <el-radio :label="false" class="option-item">
                  <span class="option-label">错误</span>
                </el-radio>
              </el-radio-group>
            </template>

            <!-- 填空题 -->
            <template v-else-if="currentQuestion.type === 'fill'">
              <el-input
                v-model="answers[currentQuestion.id]"
                placeholder="请输入答案"
                class="fill-input"
              />
            </template>
          </div>
        </el-card>

        <!-- 导航按钮 -->
        <div class="question-nav">
          <el-button
            :disabled="currentIndex === 0"
            @click="prevQuestion"
            size="large"
          >
            <el-icon><ArrowLeft /></el-icon>
            上一题
          </el-button>
          <el-button
            v-if="currentIndex < questions.length - 1"
            type="primary"
            @click="nextQuestion"
            size="large"
          >
            下一题
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button
            v-else
            type="success"
            @click="submitExam"
            :loading="submitting"
            size="large"
          >
            <el-icon><Check /></el-icon>
            提交试卷
          </el-button>
        </div>
      </div>

      <!-- 右侧题号导航 -->
      <div class="nav-panel">
        <el-card>
          <template #header>
            <span>答题卡</span>
          </template>
          <div class="answer-stats">
            <div class="stat-item">
              <span class="stat-dot answered"></span>
              <span>已答 {{ answeredCount }} 题</span>
            </div>
            <div class="stat-item">
              <span class="stat-dot unanswered"></span>
              <span>未答 {{ questions.length - answeredCount }} 题</span>
            </div>
          </div>
          <el-divider />
          <div class="question-grid">
            <div
              v-for="(q, idx) in questions"
              :key="q.id"
              class="question-number-btn"
              :class="{
                'current': currentIndex === idx,
                'answered': answers[q.id] !== undefined && answers[q.id] !== ''
              }"
              @click="goToQuestion(idx)"
            >
              {{ idx + 1 }}
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 提交确认对话框 -->
    <el-dialog v-model="submitDialogVisible" title="确认提交" width="400px" :close-on-click-modal="false">
      <div class="submit-confirm">
        <p>您已完成 <strong>{{ answeredCount }}</strong> / {{ questions.length }} 题</p>
        <p v-if="answeredCount < questions.length" class="warning">
          还有 {{ questions.length - answeredCount }} 道题未作答，确定要提交吗？
        </p>
        <p v-else class="success">所有题目已作答，确认提交吗？</p>
      </div>
      <template #footer>
        <el-button @click="submitDialogVisible = false">继续答题</el-button>
        <el-button type="primary" @click="confirmSubmit" :loading="submitting">
          确认提交
        </el-button>
      </template>
    </el-dialog>

    <!-- 时间到自动提交对话框 -->
    <el-dialog v-model="timeoutDialogVisible" title="考试结束" width="400px" :close-on-click-modal="false" :show-close="false">
      <div class="timeout-message">
        <el-icon :size="48" color="#f56c6c"><CircleClose /></el-icon>
        <p>考试时间已到，系统将自动提交试卷</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, ArrowLeft, ArrowRight, Check, CircleClose } from '@element-plus/icons-vue'
import api from '../../api'
import { parseDateTimeForCompare } from '../../utils/dateTime'

const route = useRoute()
const router = useRouter()

const studentExamId = ref('')
const examId = ref('')
const examTitle = ref('在线考试')
const duration = ref(60)
const startTime = ref('')
const questions = ref<any[]>([])
const answers = ref<Record<number, any>>({})
const currentIndex = ref(0)
const remainingTime = ref(0)
const submitting = ref(false)
const submitDialogVisible = ref(false)
const timeoutDialogVisible = ref(false)

let timerInterval: number | null = null

const currentQuestion = computed(() => questions.value[currentIndex.value])

const answeredCount = computed(() => {
  return questions.value.filter(q => {
    const answer = answers.value[q.id]
    return answer !== undefined && answer !== ''
  }).length
})

const categoryNames: Record<string, string> = {
  file: '文件管理',
  text: '文本处理',
  system: '系统监控',
  network: '网络工具',
  permission: '权限管理',
  package: '软件包',
  compression: '压缩归档',
  search: '搜索查找',
  shell: 'Shell脚本',
  mysql: 'MySQL学习',
  nginx: 'Nginx 学习',
  redis: 'Redis 学习',
  docker: 'Docker 学习',
}

function getCategoryName(key: string): string {
  return categoryNames[key] || key
}

function getQuestionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    choice: 'primary',
    truefalse: 'success',
    fill: 'warning'
  }
  return colors[type] || 'info'
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    choice: '选择题',
    truefalse: '判断题',
    fill: '填空题'
  }
  return labels[type] || type
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

function goToQuestion(index: number) {
  currentIndex.value = index
}

function startTimer() {
  const examStartTime = startTime.value ? (parseDateTimeForCompare(startTime.value)?.getTime() ?? Date.now()) : Date.now()
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - examStartTime) / 1000))
  remainingTime.value = Math.max(duration.value * 60 - elapsedSeconds, 0)

  if (remainingTime.value === 0) {
    handleTimeout()
    return
  }

  timerInterval = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
      if (remainingTime.value === 0) {
        handleTimeout()
      }
    }
  }, 1000)
}

function handleTimeout() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  timeoutDialogVisible.value = true
  setTimeout(() => {
    confirmSubmit()
  }, 2000)
}

function submitExam() {
  submitDialogVisible.value = true
}

async function exitExam() {
  try {
    await ElMessageBox.confirm(
      '确定要退出考试吗？当前答案不会提交，请谨慎操作。',
      '退出考试',
      {
        confirmButtonText: '确认退出',
        cancelButtonText: '继续答题',
        type: 'warning'
      }
    )
    router.push('/linux-exam')
  } catch {
    // 用户选择继续答题时不需要额外处理
  }
}

async function confirmSubmit() {
  if (submitting.value) return

  submitting.value = true
  try {
    const answerList = questions.value.map(q => ({
      questionId: q.id,
      answer: answers.value[q.id] ?? null
    }))

    await api.post(`/linux-exam/student-exams/${studentExamId.value}/submit`, {
      answers: answerList
    })

    ElMessage.success('考试提交成功')
    router.push('/linux-exam')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '提交失败')
  } finally {
    submitting.value = false
    submitDialogVisible.value = false
    timeoutDialogVisible.value = false
  }
}

async function loadExamData() {
  const queryStudentExamId = route.query.studentExamId as string
  const queryExamId = route.query.examId as string
  const queryDuration = route.query.duration as string
  const queryStartTime = route.query.startTime as string

  if (!queryStudentExamId || !queryExamId) {
    ElMessage.error('考试参数错误')
    router.push('/linux-exam')
    return
  }

  studentExamId.value = queryStudentExamId
  examId.value = queryExamId
  duration.value = parseInt(queryDuration) || 60
  startTime.value = queryStartTime || ''

  try {
    const cachedExam = sessionStorage.getItem(`linux-exam:${studentExamId.value}`)
    if (cachedExam) {
      const parsedCache = JSON.parse(cachedExam)
      examTitle.value = parsedCache.examTitle || examTitle.value
      questions.value = Array.isArray(parsedCache.questions) ? parsedCache.questions : []
    }

    if (!startTime.value) {
      const recordRes = await api.get(`/linux-exam/student-exams/${studentExamId.value}`)
      startTime.value = recordRes.data.data.startTime
    }

    if (questions.value.length === 0) {
      const res = await api.get(`/linux-exam/exams/${examId.value}`)
      const exam = res.data.data
      examTitle.value = exam.title
      questions.value = Array.isArray(exam.questions) ? exam.questions : []
    }

    if (questions.value.length === 0) {
      ElMessage.error('考试题目加载失败')
      router.push('/linux-exam')
      return
    }

    questions.value.forEach(q => {
      answers.value[q.id] = undefined
    })

    startTimer()
  } catch {
    ElMessage.error('加载考试失败')
    router.push('/linux-exam')
  }
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (!submitting.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  loadExamData()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  if (studentExamId.value) {
    sessionStorage.removeItem(`linux-exam:${studentExamId.value}`)
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.exam-taking {
  min-height: 100vh;
  background: #f5f7fa;
}

.exam-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  color: #1f2329;
}

.exam-info {
  color: #646a73;
  font-size: 14px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
  color: #1f2329;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.timer.warning {
  color: #e6a23c;
  background: #fdf6ec;
}

.timer.danger {
  color: #f56c6c;
  background: #fef0f0;
  animation: pulse 1s infinite;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.exam-content {
  display: flex;
  gap: 20px;
  padding: 84px 24px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.question-area {
  flex: 1;
}

.question-card {
  min-height: 400px;
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.question-number {
  font-size: 16px;
  font-weight: bold;
  color: #1f2329;
}

.question-text {
  font-size: 16px;
  color: #1f2329;
  line-height: 1.6;
  margin-bottom: 24px;
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #3370ff;
  background: #f5f7ff;
}

.option-label {
  font-weight: 500;
  margin-right: 8px;
}

.option-text {
  color: #1f2329;
}

.fill-input {
  max-width: 400px;
}

.question-nav {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
}

.nav-panel {
  width: 280px;
  flex-shrink: 0;
}

.answer-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.stat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.stat-dot.answered {
  background: #67c23a;
}

.stat-dot.unanswered {
  background: #dcdfe6;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.question-number-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.question-number-btn:hover {
  border-color: #3370ff;
  color: #3370ff;
}

.question-number-btn.current {
  border-color: #3370ff;
  background: #3370ff;
  color: white;
}

.question-number-btn.answered {
  border-color: #67c23a;
  background: #f0f9ff;
  color: #67c23a;
}

.question-number-btn.answered.current {
  background: #67c23a;
  color: white;
}

.submit-confirm {
  text-align: center;
  padding: 20px 0;
}

.submit-confirm p {
  margin: 8px 0;
  font-size: 16px;
}

.submit-confirm .warning {
  color: #e6a23c;
}

.submit-confirm .success {
  color: #67c23a;
}

.timeout-message {
  text-align: center;
  padding: 20px;
}

.timeout-message p {
  margin-top: 16px;
  font-size: 16px;
  color: #606266;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #3370ff;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #3370ff;
  background: #3370ff;
}
</style>


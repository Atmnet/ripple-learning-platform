<template>
  <div class="exam-list">
    <section class="hero-strip">
      <div class="hero-copy">
        <h1>在线考试</h1>
        <p>当前已发布的考试、待参加状态和成绩回看都集中在这里处理，不再跳出工作台。</p>
      </div>
      <div class="status-pills">
        <span class="status-pill is-upcoming">待参加</span>
        <span class="status-pill is-active">进行中</span>
        <span class="status-pill is-completed">已完成</span>
      </div>
    </section>

    <div v-if="loading" class="loading-panel glass-panel">
      <el-skeleton :rows="4" animated />
    </div>

    <el-empty v-else-if="exams.length === 0" description="暂无考试安排" class="empty-panel" />

    <div v-else class="exam-grid">
      <el-card
        v-for="exam in exams"
        :key="exam.id"
        class="exam-card"
        :class="getCardClass(exam)"
        shadow="never"
      >
        <div class="exam-card-top">
          <div>
            <div class="exam-title">{{ exam.title }}</div>
            <div class="exam-description">{{ exam.description || '本场考试暂未填写说明。' }}</div>
          </div>
          <el-tag :type="getStatusType(exam)" size="large">
            {{ getStatusText(exam) }}
          </el-tag>
        </div>

        <div class="exam-meta-grid">
          <div class="meta-item">
            <el-icon><Timer /></el-icon>
            <div>
              <span class="meta-label">开始时间</span>
              <span class="meta-value">{{ formatDate(exam.startTime) }}</span>
            </div>
          </div>
          <div class="meta-item">
            <el-icon><Clock /></el-icon>
            <div>
              <span class="meta-label">考试时长</span>
              <span class="meta-value">{{ exam.duration }} 分钟</span>
            </div>
          </div>
          <div class="meta-item">
            <el-icon><Document /></el-icon>
            <div>
              <span class="meta-label">题目数量</span>
              <span class="meta-value">{{ exam.totalQuestions }} 题</span>
            </div>
          </div>
          <div class="meta-item">
            <el-icon><Trophy /></el-icon>
            <div>
              <span class="meta-label">及格分数</span>
              <span class="meta-value">{{ exam.passingScore }} 分</span>
            </div>
          </div>
        </div>

        <div class="category-row">
          <el-tag
            v-for="cat in exam.categories"
            :key="cat"
            size="small"
            effect="plain"
            class="category-tag"
          >
            {{ getCategoryName(cat) }}
          </el-tag>
        </div>

        <div class="exam-actions">
          <el-button v-if="exam.hasCompleted" type="success" @click="viewResult(exam)">
            查看成绩
          </el-button>
          <el-button v-else-if="exam.canStart" type="primary" @click="startExam(exam)">
            开始考试
          </el-button>
          <el-button v-else-if="isFutureTime(exam.startTime)" type="info" disabled>
            未开始
          </el-button>
          <el-button v-else type="info" disabled>
            已结束
          </el-button>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="startDialogVisible" title="开始考试" width="520px">
      <div class="start-confirm">
        <p class="warning-text">
          <el-icon><Warning /></el-icon>
          考试即将开始，请先确认以下规则
        </p>
        <ul class="rules">
          <li>考试时长为 <strong>{{ currentExam?.duration }}</strong> 分钟，到时间后将自动提交。</li>
          <li>共 <strong>{{ currentExam?.totalQuestions || 0 }}</strong> 题，请尽量一次完成。</li>
          <li>考试过程中请勿刷新页面或关闭浏览器。</li>
          <li>每位学员仅限参加一次，开始后请连续作答。</li>
        </ul>
      </div>
      <template #footer>
        <el-button @click="startDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="starting" @click="confirmStartExam">
          确认开始
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resultDialogVisible" title="考试结果" width="640px">
      <div v-if="examResult" class="exam-result">
        <div class="score-display" :class="getScoreClass(examResult.score)">
          <div class="score-value">{{ examResult.score }}</div>
          <div class="score-label">分</div>
        </div>

        <el-row :gutter="16" class="stats">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-num correct">{{ examResult.correctCount }}</div>
              <div class="stat-caption">正确</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-num wrong">{{ examResult.wrongCount }}</div>
              <div class="stat-caption">错误</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-num">{{ examResult.score >= 60 ? '通过' : '未通过' }}</div>
              <div class="stat-caption">结果</div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div v-if="wrongQuestions.length > 0" class="wrong-questions">
          <h4>错题回顾（{{ wrongQuestions.length }} 题）</h4>
          <div
            v-for="(q, index) in wrongQuestions.slice(0, 5)"
            :key="q.questionId"
            class="wrong-item"
          >
            <div class="question-title">
              <span class="q-num">{{ index + 1 }}.</span>
              <span>{{ q.question }}</span>
            </div>
            <div class="answers">
              <div class="your-answer">
                <span>你的答案:</span>
                <el-tag type="danger">{{ formatAnswer(q.yourAnswer, q.type) }}</el-tag>
              </div>
              <div class="correct-answer">
                <span>正确答案:</span>
                <el-tag type="success">{{ formatCorrectAnswer(q.correctAnswer, q.type) }}</el-tag>
              </div>
            </div>
          </div>
          <div v-if="wrongQuestions.length > 5" class="more-wrong">
            还有 {{ wrongQuestions.length - 5 }} 道错题未展开
          </div>
        </div>

        <div v-else class="perfect">
          <el-icon :size="48" color="#67c23a"><CircleCheck /></el-icon>
          <p>这场考试全部答对，表现很不错。</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck, Clock, Document, Timer, Trophy, Warning } from '@element-plus/icons-vue'
import api from '../../api'
import { formatDateTimeText, parseDateTimeForCompare } from '../../utils/dateTime'

const router = useRouter()
const loading = ref(false)
const exams = ref<any[]>([])
const startDialogVisible = ref(false)
const resultDialogVisible = ref(false)
const currentExam = ref<any>(null)
const starting = ref(false)
const examResult = ref<any>(null)
const wrongQuestions = ref<any[]>([])

const categoryNames: Record<string, string> = {
  file: '文件管理',
  text: '文本处理',
  system: '系统监控',
  network: '网络工具',
  permission: '权限管理',
  package: '软件包管理',
  compression: '压缩归档',
  search: '搜索查找',
  shell: 'Shell 脚本',
  mysql: 'MySQL 学习',
}

function getCategoryName(key: string) {
  return categoryNames[key] || key
}

function formatDate(date: string) {
  return formatDateTimeText(date)
}

function isFutureTime(date: string) {
  const parsed = parseDateTimeForCompare(date)
  return parsed ? parsed > new Date() : false
}

function getStatusType(exam: any) {
  if (exam.hasCompleted) return 'success'
  if (exam.canStart) return 'danger'
  if (isFutureTime(exam.startTime)) return 'warning'
  return 'info'
}

function getStatusText(exam: any) {
  if (exam.hasCompleted) return '已完成'
  if (exam.canStart) return '进行中'
  if (isFutureTime(exam.startTime)) return '未开始'
  return '已结束'
}

function getCardClass(exam: any) {
  if (exam.hasCompleted) return 'is-completed'
  if (exam.canStart) return 'is-active'
  if (isFutureTime(exam.startTime)) return 'is-upcoming'
  return 'is-ended'
}

function getScoreClass(score: number) {
  if (score >= 90) return 'excellent'
  if (score >= 60) return 'pass'
  return 'fail'
}

function formatAnswer(answer: any, type: string) {
  if (type === 'truefalse') return answer === true ? '正确' : '错误'
  if (type === 'choice' && typeof answer === 'number') return String.fromCharCode(65 + answer)
  if (Array.isArray(answer)) return answer.join(' / ')
  return String(answer)
}

function formatCorrectAnswer(answer: any, type: string) {
  if (type === 'truefalse') return answer === true ? '正确' : '错误'
  if (type === 'choice' && typeof answer === 'number') return String.fromCharCode(65 + answer)
  if (Array.isArray(answer)) return answer.join(' / ')
  return String(answer)
}

async function fetchExams() {
  loading.value = true
  try {
    const res = await api.get('/linux-exam/exams/published')
    exams.value = res.data.data || []
  } catch {
    ElMessage.error('获取考试列表失败')
  } finally {
    loading.value = false
  }
}

function startExam(exam: any) {
  currentExam.value = exam
  startDialogVisible.value = true
}

async function confirmStartExam() {
  if (!currentExam.value) return

  starting.value = true
  try {
    const res = await api.post(`/linux-exam/exams/${currentExam.value.id}/start`)
    const { studentExamId, exam, questions, duration } = res.data.data

    sessionStorage.setItem(
      `linux-exam:${studentExamId}`,
      JSON.stringify({
        examTitle: exam.title,
        questions,
      }),
    )

    router.push({
      path: '/linux-exam/taking',
      query: {
        studentExamId,
        examId: exam.id,
        duration,
        startTime: String(res.data.data.startTime),
      },
    })
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '开始考试失败')
  } finally {
    starting.value = false
    startDialogVisible.value = false
  }
}

async function viewResult(exam: any) {
  try {
    const res = await api.get('/linux-exam/student-exams')
    const record = (res.data.data || []).find((item: any) => item.examId === exam.id)
    if (!record) return

    const resultRes = await api.get(`/linux-exam/student-exams/${record.id}`)
    examResult.value = resultRes.data.data
    wrongQuestions.value = examResult.value?.wrongQuestions || []
    resultDialogVisible.value = true
  } catch {
    ElMessage.error('获取成绩失败')
  }
}

onMounted(fetchExams)
</script>

<style scoped>
.exam-list {
  min-height: 100%;
  padding: 24px;
  background: transparent;
}

.hero-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 0 0 4px;
  margin-bottom: 20px;
}

.hero-copy h1 {
  margin: 0;
  color: #19324f;
  font-size: 24px;
  line-height: 1.3;
}

.hero-copy p {
  margin: 8px 0 0;
  max-width: 640px;
  color: #52607a;
  font-size: 13px;
  line-height: 1.65;
}

.status-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.status-pill.is-upcoming {
  background: rgba(250, 204, 21, 0.12);
  color: #a16207;
}

.status-pill.is-active {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.status-pill.is-completed {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.loading-panel {
  padding: 24px;
  border-radius: 32px;
}

.exam-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

.exam-card {
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 38px rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(20px);
}

.exam-card.is-active {
  box-shadow: 0 22px 40px rgba(239, 68, 68, 0.12);
}

.exam-card.is-upcoming {
  box-shadow: 0 22px 40px rgba(250, 204, 21, 0.12);
}

.exam-card.is-completed {
  box-shadow: 0 22px 40px rgba(34, 197, 94, 0.12);
}

.exam-card-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.exam-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.exam-description {
  margin-top: 8px;
  color: #52607a;
  line-height: 1.7;
}

.exam-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.meta-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.54);
}

.meta-item .el-icon {
  margin-top: 2px;
  color: #2563eb;
}

.meta-label {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.meta-value {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-weight: 600;
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.category-tag {
  border-radius: 999px;
}

.exam-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 22px;
}

.start-confirm {
  padding: 4px 6px;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b45309;
  font-weight: 600;
}

.rules {
  margin: 14px 0 0;
  padding-left: 18px;
  color: #52607a;
  line-height: 1.8;
}

.exam-result {
  padding: 10px 4px;
}

.score-display {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}

.score-display.excellent {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.score-display.pass {
  background: linear-gradient(135deg, #f59e0b, #f97316);
}

.score-display.fail {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.score-value {
  font-size: 36px;
  font-weight: 700;
}

.score-label {
  opacity: 0.84;
}

.stats {
  margin-bottom: 12px;
}

.stat-item {
  text-align: center;
  padding: 16px 12px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.88);
}

.stat-num {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.stat-num.correct {
  color: #16a34a;
}

.stat-num.wrong {
  color: #dc2626;
}

.stat-caption {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

.wrong-item {
  padding: 16px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.88);
  margin-bottom: 12px;
}

.question-title {
  display: flex;
  gap: 8px;
  color: #0f172a;
  font-weight: 600;
}

.answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.your-answer,
.correct-answer {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  color: #52607a;
}

.more-wrong,
.perfect {
  text-align: center;
  color: #52607a;
}

@media (max-width: 768px) {
  .exam-list {
    padding: 16px;
  }

  .hero-strip {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-copy h1 {
    font-size: 20px;
  }

  .status-pills {
    justify-content: flex-start;
  }

  .exam-meta-grid {
    grid-template-columns: 1fr;
  }

  .exam-card-top {
    flex-direction: column;
  }
}
</style>


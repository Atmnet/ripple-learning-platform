<template>
  <div class="linux-quiz">
    <!-- Quiz Settings -->
    <div v-if="!quizStarted && !reviewMode" class="quiz-settings">
      <h2 class="page-title">知识测验</h2>

      <el-card class="settings-card">
        <template #header>
          <div class="settings-header">
            <span>测验设置</span>
          </div>
        </template>

        <el-form :model="quizSettings" label-position="top">
          <el-form-item label="测验模式">
            <el-radio-group v-model="quizSettings.mode">
              <el-radio label="normal">普通测验</el-radio>
              <el-radio label="wrong">错题复习</el-radio>
            </el-radio-group>
          </el-form-item>

          <template v-if="quizSettings.mode === 'normal'">
            <el-form-item label="题目数量">
              <el-slider
                v-model="quizSettings.count"
                :min="5"
                :max="30"
                :step="5"
                show-stops
                :disabled="quizSettings.allQuestions"
              />
              <span class="slider-value">{{ quizSettings.allQuestions ? '当前筛选下全部考题' : `${quizSettings.count} 题` }}</span>
            </el-form-item>

            <el-form-item label="题目分类">
              <el-select v-model="quizSettings.category" placeholder="全部分类" clearable>
                <el-option
                  v-for="cat in categories"
                  :key="cat"
                  :label="getCategoryName(cat)"
                  :value="cat"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="考题范围">
              <el-switch
                v-model="quizSettings.allQuestions"
                active-text="全部考题"
                inactive-text="随机抽题"
              />
              <span class="range-tip">
                {{ quizSettings.allQuestions ? '将测试当前分类、题型下的全部题目' : '从当前分类、题型中随机抽题' }}
              </span>
            </el-form-item>

            <el-form-item label="题目类型">
              <el-radio-group v-model="quizSettings.type">
                <el-radio label="">全部</el-radio>
                <el-radio label="choice">选择题</el-radio>
                <el-radio label="truefalse">判断题</el-radio>
                <el-radio label="fill">填空题</el-radio>
              </el-radio-group>
            </el-form-item>

            <div class="category-all-panel">
              <div class="category-all-title">按分类进行全部考题测试</div>
              <div class="category-all-grid">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  type="button"
                  class="category-all-card"
                  @click="startCategoryAllQuiz(cat)"
                >
                  <span>{{ getCategoryName(cat) }}</span>
                  <small>全部考题</small>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <el-alert
              v-if="wrongQuestions.length === 0"
              title="暂无错题"
              type="info"
              description="你还没有做错过的题目，先去测验吧。"
              show-icon
              :closable="false"
              style="margin-bottom: 16px;"
            />
            <div v-else class="wrong-questions-preview">
              <p class="wrong-count">共有 <strong>{{ wrongQuestions.length }}</strong> 道错题需要复习</p>
              <div class="wrong-categories">
                <el-tag
                  v-for="cat in wrongQuestionCategories"
                  :key="cat"
                  size="small"
                  style="margin-right: 8px; margin-bottom: 8px;"
                >
                  {{ getCategoryName(cat) }} ({{ getWrongCountByCategory(cat) }})
                </el-tag>
              </div>
            </div>
          </template>
        </el-form>

        <div class="settings-actions">
          <el-button
            type="primary"
            size="large"
            @click="startQuiz"
            :disabled="quizSettings.mode === 'wrong' && wrongQuestions.length === 0"
          >
            {{ quizSettings.mode === 'wrong' ? '开始错题复习' : (quizSettings.allQuestions ? '开始全部考题测试' : '开始测验') }}
          </el-button>
        </div>

        <div class="quiz-stats" v-if="stats">
          <el-divider />
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总题目</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.choiceCount }}</div>
              <div class="stat-label">选择题</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.trueFalseCount }}</div>
              <div class="stat-label">判断题</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ wrongQuestions.length }}</div>
              <div class="stat-label">错题</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Wrong Questions List -->
      <el-card v-if="wrongQuestions.length > 0" class="wrong-questions-card" style="margin-top: 20px;">
        <template #header>
          <div class="wrong-header">
            <span>错题记录</span>
            <el-button type="danger" link size="small" @click="clearWrongQuestions">
              清空错题
            </el-button>
          </div>
        </template>

        <div class="wrong-list">
          <div
            v-for="(item, index) in wrongQuestions.slice(0, 10)"
            :key="item.id"
            class="wrong-item"
          >
            <div class="wrong-info">
              <el-tag size="small" :type="getQuestionTypeColor(item.type)">
                {{ getQuestionTypeLabel(item.type) }}
              </el-tag>
              <span class="category">{{ getCategoryName(item.category) }}</span>
              <span class="question-text">{{ truncateQuestion(item.question) }}</span>
            </div>
            <div class="wrong-meta">
              <span class="wrong-time">{{ formatTime(item.timestamp) }}</span>
              <span class="wrong-count">答错 {{ item.wrongCount }} 次</span>
            </div>
          </div>
          <p v-if="wrongQuestions.length > 10" class="more-wrong">
            还有 {{ wrongQuestions.length - 10 }} 道错题...
          </p>
        </div>
      </el-card>
    </div>

    <!-- Quiz In Progress -->
    <div v-else-if="quizStarted" class="quiz-in-progress">
      <div class="quiz-header glass-panel">
        <div class="quiz-header-copy">
          <span class="intro-eyebrow">{{ reviewMode ? 'Wrong Review' : 'Quiz Session' }}</span>
          <h2>{{ reviewMode ? '错题复习' : '知识测验' }}</h2>
        </div>
        <div class="quiz-progress">
          <el-progress
            :percentage="progressPercentage"
            :format="() => `${currentQuestionIndex + 1} / ${questions.length}`"
            class="progress-bar"
          />
          <div class="score-display">
            得分: <span class="score">{{ score }}</span>
          </div>
          <el-button class="ghost-action" @click="quitQuiz">退出当前测验</el-button>
        </div>
      </div>

      <!-- Question Card -->
      <el-card class="question-card" v-loading="loading">
        <div class="question-content" v-if="currentQuestion">
          <div class="question-type">
            <el-tag :type="getQuestionTypeColor(currentQuestion.type)" size="small">
              {{ getQuestionTypeLabel(currentQuestion.type) }}
            </el-tag>
            <span class="category-tag">{{ getCategoryName(currentQuestion.category) }}</span>
          </div>

          <h3 class="question-text">{{ currentQuestion.question }}</h3>

          <!-- Choice Question -->
          <div v-if="currentQuestion.type === 'choice' && currentQuestion.options" class="options-list">
            <el-radio-group v-model="currentAnswer" class="choice-options">
              <el-radio
                v-for="(option, idx) in currentQuestion.options"
                :key="idx"
                :label="idx"
                :class="{
                  'correct-option': hasSubmitted && idx === correctAnswer,
                  'wrong-option': hasSubmitted && idx === currentAnswer && idx !== correctAnswer
                }"
              >
                {{ String.fromCharCode(65 + idx) }}. {{ option }}
              </el-radio>
            </el-radio-group>
          </div>

          <!-- True/False Question -->
          <div v-else-if="currentQuestion.type === 'truefalse'" class="truefalse-options">
            <el-radio-group v-model="currentAnswer">
              <el-radio :label="true" :class="{ 'correct-option': hasSubmitted && correctAnswer === true, 'wrong-option': hasSubmitted && currentAnswer === true && correctAnswer !== true }">正确</el-radio>
              <el-radio :label="false" :class="{ 'correct-option': hasSubmitted && correctAnswer === false, 'wrong-option': hasSubmitted && currentAnswer === false && correctAnswer !== false }">错误</el-radio>
            </el-radio-group>
          </div>

          <!-- Fill Question -->
          <div v-else-if="currentQuestion.type === 'fill'" class="fill-input">
            <el-input
              v-model="currentAnswer"
              placeholder="请输入答案"
              size="large"
              :class="{ 'is-correct': hasSubmitted && isAnswerCorrect, 'is-wrong': hasSubmitted && !isAnswerCorrect }"
            />
          </div>

          <!-- Explanation -->
          <el-alert
            v-if="hasSubmitted"
            :title="isAnswerCorrect ? '回答正确' : '回答错误'"
            :type="isAnswerCorrect ? 'success' : 'error'"
            :description="explanation"
            show-icon
            :closable="false"
            class="explanation-alert"
          />
        </div>

        <template #footer>
          <div class="question-actions">
            <el-button v-if="!hasSubmitted" type="primary" size="large" @click="submitAnswer">
              提交答案
            </el-button>
            <el-button v-else type="primary" size="large" @click="nextQuestion">
              {{ isLastQuestion ? '查看结果' : '下一题' }}
            </el-button>
          </div>
        </template>
      </el-card>

      <!-- Results Dialog -->
      <el-dialog
        v-model="resultsVisible"
        :title="reviewMode ? '错题复习完成' : '测验结果'"
        width="500px"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <div class="results-content">
          <div class="score-circle">
            <div class="score-value">{{ score }}</div>
            <div class="score-total">/ {{ questions.length }}</div>
          </div>

          <div class="result-stats">
            <div class="result-item">
              <span class="result-label">正确率</span>
              <span class="result-value" :class="getScoreClass()">{{ accuracy }}%</span>
            </div>
            <div class="result-item">
              <span class="result-label">评级</span>
              <span class="result-value" :class="getScoreClass()">{{ getGrade() }}</span>
            </div>
          </div>

          <div v-if="wrongInThisQuiz.length > 0 && !reviewMode" class="wrong-in-quiz">
            <el-divider />
            <p class="wrong-title">
              <el-icon><Warning /></el-icon>
              本次答错 {{ wrongInThisQuiz.length }} 题
            </p>
            <el-button type="warning" @click="startWrongReview">
              复习错题
            </el-button>
          </div>

          <el-divider />

          <p class="result-message">{{ getResultMessage() }}</p>
        </div>

        <template #footer>
          <el-button type="primary" @click="restartQuiz">再来一次</el-button>
          <el-button @click="goBack">返回测验面板</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import {
  getQuizQuestions,
  submitQuizAnswer,
  getQuizStats,
  type QuizQuestion,
  type QuizAnswerResult,
} from '../../api/linux'

const router = useRouter()

// Category names mapping
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
}

// Wrong question storage
const WRONG_QUESTIONS_KEY = 'linux-quiz-wrong-questions'

interface WrongQuestionRecord extends QuizQuestion {
  wrongCount: number
  timestamp: number
  lastWrongAnswer: string | number | boolean
}

const wrongQuestions = ref<WrongQuestionRecord[]>([])
const wrongInThisQuiz = ref<WrongQuestionRecord[]>([])
const reviewMode = ref(false)

// Load wrong questions from localStorage
function loadWrongQuestions() {
  try {
    const stored = localStorage.getItem(WRONG_QUESTIONS_KEY)
    if (stored) {
      wrongQuestions.value = JSON.parse(stored)
    }
  } catch {
    wrongQuestions.value = []
  }
}

// Save wrong questions to localStorage
function saveWrongQuestions() {
  localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(wrongQuestions.value))
}

// Add wrong question
function addWrongQuestion(question: QuizQuestion, answer: string | number | boolean) {
  const existing = wrongQuestions.value.find(q => q.id === question.id)
  if (existing) {
    existing.wrongCount++
    existing.timestamp = Date.now()
    existing.lastWrongAnswer = answer
  } else {
    wrongQuestions.value.push({
      ...question,
      wrongCount: 1,
      timestamp: Date.now(),
      lastWrongAnswer: answer,
    })
  }
  saveWrongQuestions()
}

// Remove wrong question (when answered correctly in review)
function removeWrongQuestion(questionId: number) {
  wrongQuestions.value = wrongQuestions.value.filter(q => q.id !== questionId)
  saveWrongQuestions()
}

// Clear all wrong questions
async function clearWrongQuestions() {
  try {
    await ElMessageBox.confirm('确定要清空所有错题记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    wrongQuestions.value = []
    saveWrongQuestions()
    ElMessage.success('错题记录已清空')
  } catch {
    // Cancelled
  }
}

// Get wrong questions count by category
function getWrongCountByCategory(category: string): number {
  return wrongQuestions.value.filter(q => q.category === category).length
}

// Get wrong question categories
const wrongQuestionCategories = computed(() => {
  const cats = new Set(wrongQuestions.value.map(q => q.category))
  return Array.from(cats)
})

// Truncate question text
function truncateQuestion(question: string): string {
  if (question.length <= 50) return question
  return question.slice(0, 50) + '...'
}

// Format time
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

const categories = ref<string[]>([])
const stats = ref<{ total: number; choiceCount: number; trueFalseCount: number; fillCount: number; categories: string[] } | null>(null)
const quizStarted = ref(false)
const loading = ref(false)
const questions = ref<QuizQuestion[]>([])
const currentQuestionIndex = ref(0)
const currentAnswer = ref<string | number | boolean>('')
const hasSubmitted = ref(false)
const isAnswerCorrect = ref(false)
const correctAnswer = ref<string | number | boolean | string[] | null>(null)
const explanation = ref('')
const score = ref(0)
const resultsVisible = ref(false)

const quizSettings = reactive({
  count: 10,
  category: '',
  type: '',
  allQuestions: false,
  mode: 'normal' as 'normal' | 'wrong',
})

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === questions.value.length - 1
})

const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
})

const accuracy = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round((score.value / questions.value.length) * 100)
})

onMounted(async () => {
  await fetchStats()
  loadWrongQuestions()
})

async function fetchStats() {
  try {
    const res = await getQuizStats()
    stats.value = res.data.data
    categories.value = res.data.data.categories
  } catch {
    // Silent fail
  }
}

function getCategoryName(category: string): string {
  return categoryNames[category] || category
}

function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case 'choice':
      return '选择题'
    case 'truefalse':
      return '判断题'
    case 'fill':
      return '填空题'
    default:
      return type
  }
}

function getQuestionTypeColor(type: string): 'primary' | 'success' | 'warning' {
  switch (type) {
    case 'choice':
      return 'primary'
    case 'truefalse':
      return 'success'
    case 'fill':
      return 'warning'
    default:
      return 'primary'
  }
}

async function startQuiz() {
  loading.value = true
  try {
    if (quizSettings.mode === 'wrong') {
      // Start wrong question review
      if (wrongQuestions.value.length === 0) {
        ElMessage.warning('暂无错题可复习')
        loading.value = false
        return
      }
      // Shuffle and limit wrong questions
      const shuffled = [...wrongQuestions.value].sort(() => Math.random() - 0.5)
      questions.value = shuffled.slice(0, Math.min(quizSettings.count, shuffled.length))
      reviewMode.value = true
    } else {
      // Normal quiz
      const res = await getQuizQuestions({
        count: quizSettings.allQuestions ? undefined : quizSettings.count,
        category: quizSettings.category || undefined,
        type: quizSettings.type || undefined,
        all: quizSettings.allQuestions,
      })
      questions.value = res.data.data
      reviewMode.value = false
    }

    if (questions.value.length === 0) {
      ElMessage.warning('当前筛选条件下暂无题目')
      quizStarted.value = false
      return
    }

    quizStarted.value = true
    currentQuestionIndex.value = 0
    score.value = 0
    wrongInThisQuiz.value = []
    resetQuestionState()
  } catch {
    ElMessage.error('获取题目失败')
  } finally {
    loading.value = false
  }
}

function startCategoryAllQuiz(category: string) {
  quizSettings.mode = 'normal'
  quizSettings.category = category
  quizSettings.type = ''
  quizSettings.allQuestions = true
  startQuiz()
}

function resetQuestionState() {
  currentAnswer.value = ''
  hasSubmitted.value = false
  isAnswerCorrect.value = false
  correctAnswer.value = null
  explanation.value = ''
}

async function submitAnswer() {
  if (currentAnswer.value === '' || currentAnswer.value === null || currentAnswer.value === undefined) {
    ElMessage.warning('请输入答案')
    return
  }

  console.log('Submitting answer:', {
    questionId: currentQuestion.value?.id,
    answer: currentAnswer.value,
    question: currentQuestion.value
  })

  try {
    const res = await submitQuizAnswer(currentQuestion.value!.id, currentAnswer.value)
    const result: QuizAnswerResult = res.data.data

    isAnswerCorrect.value = result.isCorrect
    correctAnswer.value = result.correctAnswer
    explanation.value = result.explanation
    hasSubmitted.value = true

    if (result.isCorrect) {
      score.value++
      // Remove from wrong questions if in review mode
      if (reviewMode.value) {
        removeWrongQuestion(currentQuestion.value!.id)
      }
    } else {
      // Add to wrong questions
      addWrongQuestion(currentQuestion.value!, currentAnswer.value)
      // Track wrong questions in this quiz
      const existing = wrongInThisQuiz.value.find(q => q.id === currentQuestion.value!.id)
      if (!existing) {
        wrongInThisQuiz.value.push({
          ...currentQuestion.value!,
          wrongCount: 1,
          timestamp: Date.now(),
          lastWrongAnswer: currentAnswer.value,
        })
      }
    }
  } catch {
    ElMessage.error('提交答案失败')
  }
}

function nextQuestion() {
  if (isLastQuestion.value) {
    resultsVisible.value = true
  } else {
    currentQuestionIndex.value++
    resetQuestionState()
  }
}

function startWrongReview() {
  resultsVisible.value = false
  quizSettings.mode = 'wrong'
  startQuiz()
}

function getScoreClass(): string {
  const acc = accuracy.value
  if (acc >= 90) return 'excellent'
  if (acc >= 80) return 'good'
  if (acc >= 60) return 'pass'
  return 'fail'
}

function getGrade(): string {
  const acc = accuracy.value
  if (acc >= 90) return '优秀'
  if (acc >= 80) return '良好'
  if (acc >= 60) return '及格'
  return '不及格'
}

function getResultMessage(): string {
  const acc = accuracy.value
  if (reviewMode.value) {
    if (acc === 100) return '太棒了，所有错题都已掌握。'
    if (acc >= 80) return '很好，大部分错题已经掌握，继续加油。'
    return '继续加油，错题还需要多加练习。'
  }
  if (acc >= 90) return '太棒了，你对知识点掌握得很好。'
  if (acc >= 80) return '不错，继续保持学习状态。'
  if (acc >= 60) return '及格了，但还有提升空间。'
  return '还需要多加练习，继续加油。'
}

function quitQuiz() {
  if (confirm('确定要退出测验吗？进度将不会保存。')) {
    quizStarted.value = false
    reviewMode.value = false
  }
}

function restartQuiz() {
  resultsVisible.value = false
  quizStarted.value = false
  reviewMode.value = false
  questions.value = []
  score.value = 0
  wrongInThisQuiz.value = []
}

function goBack() {
  resultsVisible.value = false
  quizStarted.value = false
  reviewMode.value = false
}
</script>

<style scoped>
.linux-quiz {
  padding: 20px;
  min-height: 100%;
  background: transparent;
}

.glass-panel {
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.56));
  box-shadow:
    0 24px 48px rgba(20, 52, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.intro-eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.page-title {
  font-size: 24px;
  color: #1f2329;
  margin-bottom: 20px;
}

.settings-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.56));
  box-shadow:
    0 24px 48px rgba(20, 52, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.settings-header {
  font-weight: 500;
}

.slider-value {
  margin-left: 16px;
  color: #3370ff;
  font-weight: 500;
}

.range-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

.category-all-panel {
  margin: 8px 0 4px;
  padding: 14px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
}

.category-all-title {
  margin-bottom: 12px;
  color: #303133;
  font-weight: 600;
  font-size: 14px;
}

.category-all-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.category-all-card {
  border: 1px solid #d9ecff;
  border-radius: 10px;
  background: #ffffff;
  color: #303133;
  cursor: pointer;
  padding: 12px;
  text-align: left;
  transition: all 0.2s;
}

.category-all-card:hover {
  border-color: #409eff;
  box-shadow: 0 8px 18px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.category-all-card span {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

.category-all-card small {
  color: #409eff;
}

.settings-actions {
  margin-top: 24px;
  text-align: center;
}

.quiz-stats {
  margin-top: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #3370ff;
}

.stat-label {
  font-size: 14px;
  color: #646a73;
  margin-top: 4px;
}

/* Quiz In Progress Styles */
.quiz-in-progress {
  max-width: 800px;
  margin: 0 auto;
}

.quiz-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border-radius: 0;
  padding: 0 0 8px;
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.quiz-header-copy h2 {
  margin: 0;
  font-size: 28px;
  color: #0f172a;
}

.quiz-progress {
  display: flex;
  align-items: center;
  gap: 20px;
}

.ghost-action {
  border-radius: 999px;
}

.progress-bar {
  flex: 1;
}

.score-display {
  font-size: 16px;
  color: #1f2329;
}

.score-display .score {
  font-size: 24px;
  font-weight: bold;
  color: #3370ff;
}

.question-card {
  min-height: 400px;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 20px 38px rgba(148, 163, 184, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.question-content {
  padding: 20px 0;
}

.question-type {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.category-tag {
  color: #646a73;
  font-size: 14px;
}

.question-text {
  font-size: 18px;
  color: #1f2329;
  line-height: 1.6;
  margin-bottom: 24px;
}

.options-list {
  margin-bottom: 24px;
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: stretch !important;
}

.choice-options :deep(.el-radio-group) {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  width: 100% !important;
  align-items: stretch !important;
}

.choice-options :deep(.el-radio) {
  display: flex !important;
  padding: 12px 16px !important;
  border-radius: 8px !important;
  border: 1px solid #dee0e3 !important;
  transition: all 0.2s !important;
  margin-right: 0 !important;
  height: auto !important;
  min-height: 44px !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.choice-options :deep(.el-radio__input) {
  display: flex !important;
  align-items: flex-start !important;
  margin-top: 2px !important;
}

.choice-options :deep(.el-radio__label) {
  display: block !important;
  text-align: left !important;
  white-space: normal !important;
  word-break: break-word !important;
  padding-left: 8px !important;
  flex: 1 !important;
  font-size: 15px !important;
  line-height: 1.5 !important;
  margin-left: 0 !important;
  color: #1f2329 !important;
}

.choice-options :deep(.el-radio__label span),
.choice-options :deep(.el-radio__label div),
.choice-options :deep(.el-radio__label > *) {
  text-align: left !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
  display: inline !important;
}

.choice-options :deep(.el-radio:hover) {
  border-color: #3370ff;
  background: #f0f4ff;
}

.choice-options :deep(.el-radio.is-checked) {
  border-color: #3370ff;
  background: #f0f4ff;
}

.correct-option {
  border-color: #67c23a !important;
  background: #f0f9eb !important;
}

.wrong-option {
  border-color: #f56c6c !important;
  background: #fef0f0 !important;
}

.truefalse-options {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.fill-input {
  margin-bottom: 24px;
}

.fill-input :deep(.el-input__wrapper.is-correct) {
  box-shadow: 0 0 0 1px #67c23a;
}

.fill-input :deep(.el-input__wrapper.is-wrong) {
  box-shadow: 0 0 0 1px #f56c6c;
}

.explanation-alert {
  margin-top: 16px;
}

.question-actions {
  display: flex;
  justify-content: center;
}

/* Results Styles */
.results-content {
  text-align: center;
  padding: 20px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3370ff, #4080ff);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
}

.score-value {
  font-size: 36px;
  font-weight: bold;
}

.score-total {
  font-size: 16px;
  opacity: 0.8;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
}

.result-item {
  text-align: center;
}

.result-label {
  display: block;
  font-size: 14px;
  color: #646a73;
  margin-bottom: 4px;
}

.result-value {
  font-size: 20px;
  font-weight: bold;
}

.result-value.excellent {
  color: #67c23a;
}

.result-value.good {
  color: #3370ff;
}

.result-value.pass {
  color: #e6a23c;
}

.result-value.fail {
  color: #f56c6c;
}

.result-message {
  color: #646a73;
  font-size: 16px;
}

/* Mobile responsive */
.wrong-questions-preview {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.wrong-count {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #1f2329;
}

.wrong-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.wrong-questions-card {
  max-width: 600px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.56));
  box-shadow:
    0 24px 48px rgba(20, 52, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.wrong-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wrong-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 3px solid #f56c6c;
}

.wrong-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.wrong-info .category {
  font-size: 12px;
  color: #646a73;
  white-space: nowrap;
}

.wrong-info .question-text {
  flex: 1;
  font-size: 14px;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wrong-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.wrong-count {
  color: #f56c6c;
  font-weight: 500;
}

.more-wrong {
  text-align: center;
  color: #909399;
  font-size: 13px;
  margin: 8px 0 0 0;
}

.wrong-in-quiz {
  margin: 20px 0;
}

.wrong-in-quiz .wrong-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #e6a23c;
  font-size: 15px;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .linux-quiz {
    padding: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quiz-progress {
    flex-direction: column;
    gap: 12px;
  }

  .question-text {
    font-size: 16px;
  }

  .wrong-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .wrong-meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}
</style>


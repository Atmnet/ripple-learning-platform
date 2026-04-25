<template>
  <div class="mock-interview-page">
    <section class="module-heading">
      <div>
        <h1>模拟面试</h1>
        <p>选择训练方向后开始一场模拟面试，完成答题后会生成一份可复盘的训练报告。</p>
      </div>
    </section>

    <el-alert
      title="模拟面试 MVP"
      description="当前版本采用内置题库和规则评分，适合进行岗位表达训练、知识梳理和阶段复盘。"
      type="info"
      :closable="false"
      show-icon
      class="page-alert"
    />

    <div class="mock-layout">
      <div class="left-column">
        <el-card class="glass-card setup-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>开始新的模拟面试</span>
            </div>
          </template>

          <el-form label-width="88px" class="setup-form">
            <el-form-item label="训练方向">
              <el-select v-model="selectedCategory" style="width: 100%">
                <el-option v-for="item in categories" :key="item.key" :label="item.name" :value="item.key" />
              </el-select>
            </el-form-item>
            <el-form-item label="题目数量">
              <el-radio-group v-model="questionCount">
                <el-radio-button :value="3">3 题</el-radio-button>
                <el-radio-button :value="5">5 题</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <div class="category-list">
            <button
              v-for="item in categories"
              :key="item.key"
              type="button"
              class="category-card"
              :class="{ active: selectedCategory === item.key }"
              @click="selectedCategory = item.key"
            >
              <span class="category-title">{{ item.name }}</span>
              <span class="category-desc">{{ item.description }}</span>
            </button>
          </div>

          <el-button type="primary" size="large" :loading="starting" class="primary-action" @click="handleStart">
            开始模拟面试
          </el-button>
        </el-card>

        <el-card class="glass-card history-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>最近报告</span>
              <el-button type="primary" link @click="loadReports">刷新</el-button>
            </div>
          </template>

          <div v-if="reports.length" class="history-list">
            <button
              v-for="report in reports"
              :key="report.id"
              type="button"
              class="history-item"
              @click="openReport(report.id)"
            >
              <div>
                <div class="history-title">{{ report.title }}</div>
                <div class="history-time">{{ formatDate(report.createdAt) }}</div>
              </div>
              <el-tag :type="report.score >= 80 ? 'success' : report.score >= 60 ? 'warning' : 'danger'">
                {{ report.score }} 分
              </el-tag>
            </button>
          </div>
          <el-empty v-else description="还没有模拟面试报告" />
        </el-card>
      </div>

      <div class="right-column">
        <el-card v-if="activeSession" class="glass-card session-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ activeSession.title }}</span>
              <el-tag type="warning">{{ activeSession.questions.length }} 题</el-tag>
            </div>
          </template>

          <div v-for="(question, index) in activeSession.questions" :key="question.id" class="question-block">
            <div class="question-top">
              <div class="question-index">Q{{ index + 1 }}</div>
              <el-tag size="small">{{ question.scene }}</el-tag>
            </div>
            <div class="question-title">{{ question.question }}</div>
            <el-input
              v-model="answers[question.id]"
              type="textarea"
              :rows="5"
              :placeholder="`请输入你对第 ${index + 1} 题的回答`"
            />
          </div>

          <el-button type="primary" size="large" class="primary-action" :loading="submitting" @click="handleSubmit">
            提交并生成报告
          </el-button>
        </el-card>

        <el-card v-else-if="currentReport" class="glass-card report-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ currentReport.title }}</span>
              <el-tag :type="currentReport.score >= 80 ? 'success' : currentReport.score >= 60 ? 'warning' : 'danger'">
                {{ currentReport.score }} 分
              </el-tag>
            </div>
          </template>

          <div class="report-summary">
            <div class="summary-item">
              <div class="summary-label">题目数量</div>
              <div class="summary-value">{{ currentReport.questionCount }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">优势</div>
              <div class="summary-value text-list">{{ currentReport.strengths.join('、') || '暂无' }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">待加强</div>
              <div class="summary-value text-list">{{ currentReport.weaknesses.join('、') || '暂无' }}</div>
            </div>
          </div>

          <el-alert
            title="系统建议"
            :description="currentReport.suggestions.join('；') || '建议继续保持结构化表达，并补充更多场景化细节。'"
            type="success"
            :closable="false"
            show-icon
            class="report-alert"
          />

          <div class="answer-list">
            <div v-for="item in currentReport.answers" :key="item.questionId" class="answer-item">
              <div class="answer-header">
                <span>{{ item.question }}</span>
                <el-tag :type="item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'">{{ item.score }} 分</el-tag>
              </div>
              <div class="answer-text">{{ item.answer || '未作答' }}</div>
              <div class="answer-summary">{{ item.summary }}</div>
              <div class="point-row">
                <span class="point-label">命中要点：</span>
                <span>{{ item.matchedPoints.join('、') || '暂无' }}</span>
              </div>
              <div class="point-row">
                <span class="point-label">缺失要点：</span>
                <span>{{ item.missingPoints.join('、') || '暂无' }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-else class="glass-card empty-card" shadow="never">
          <el-empty description="开始一次模拟面试后，这里会展示当前题目或训练报告。" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getMockInterviewCategories,
  getMockInterviewReport,
  getMyMockInterviewReports,
  startMockInterview,
  submitMockInterview,
  type MockInterviewCategory,
  type MockInterviewReport
} from '../api/mockInterview'
import { normalizeListPayload } from '../utils/apiResponse'

const categories = ref<MockInterviewCategory[]>([])
const selectedCategory = ref('linux')
const questionCount = ref(3)
const starting = ref(false)
const submitting = ref(false)
const reports = ref<MockInterviewReport[]>([])
const currentReport = ref<MockInterviewReport | null>(null)
const activeSession = ref<{
  sessionId: string
  title: string
  questions: Array<{ id: number; question: string; scene: string }>
} | null>(null)
const answers = ref<Record<number, string>>({})

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN')
}

async function loadCategories() {
  const res = await getMockInterviewCategories()
  categories.value = normalizeListPayload(res.data).data
}

async function loadReports() {
  const res = await getMyMockInterviewReports()
  reports.value = normalizeListPayload(res.data.data ?? res.data).data
}

async function handleStart() {
  starting.value = true
  try {
    const res = await startMockInterview({ category: selectedCategory.value, count: questionCount.value })
    activeSession.value = res.data.data
    currentReport.value = null
    answers.value = {}
  } catch {
    ElMessage.error('开始模拟面试失败')
  } finally {
    starting.value = false
  }
}

async function handleSubmit() {
  if (!activeSession.value) return
  const payload = activeSession.value.questions.map((question) => ({
    questionId: question.id,
    answer: answers.value[question.id] || ''
  }))

  if (payload.some((item) => !item.answer.trim())) {
    ElMessage.warning('请先完成所有题目的回答')
    return
  }

  submitting.value = true
  try {
    const res = await submitMockInterview(activeSession.value.sessionId, payload)
    currentReport.value = res.data.data
    activeSession.value = null
    await loadReports()
  } catch {
    ElMessage.error('生成模拟面试报告失败')
  } finally {
    submitting.value = false
  }
}

async function openReport(id: string) {
  const res = await getMockInterviewReport(id)
  currentReport.value = res.data.data
  activeSession.value = null
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadReports()])
})
</script>

<style scoped>
.mock-interview-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.module-heading h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #16233b;
}

.module-heading p {
  margin: 8px 0 0;
  max-width: 720px;
  color: #627089;
  font-size: 13px;
  line-height: 1.65;
}

.page-alert,
.glass-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.mock-layout {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 22px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #22324c;
  font-weight: 700;
}

.setup-form {
  margin-bottom: 18px;
}

.category-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 18px;
}

.category-card,
.history-item {
  border: 1px solid #e5eaf4;
  background: #f8fafc;
  border-radius: 22px;
  padding: 14px 16px;
  cursor: pointer;
  text-align: left;
  transition: border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.category-card:hover,
.history-item:hover {
  transform: translateY(-2px);
  border-color: rgba(124, 92, 255, 0.25);
  box-shadow: 0 12px 24px rgba(124, 92, 255, 0.08);
}

.category-card.active {
  border-color: rgba(124, 92, 255, 0.32);
  background: linear-gradient(135deg, rgba(124, 92, 255, 0.08), rgba(255, 255, 255, 0.92));
  box-shadow: 0 12px 26px rgba(124, 92, 255, 0.08);
}

.category-title,
.history-title {
  display: block;
  font-weight: 700;
  color: #1f2937;
}

.category-desc,
.history-time,
.answer-summary,
.point-row {
  color: #6b7280;
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.6;
}

.history-list,
.answer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.primary-action {
  width: 100%;
}

.question-block {
  padding: 18px;
  border-radius: 24px;
  background: #f8fbff;
  border: 1px solid #e7edf7;
  margin-bottom: 16px;
}

.question-top,
.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.question-index {
  font-weight: 700;
  color: #7c5cff;
}

.question-title,
.answer-text {
  margin: 10px 0 12px;
  color: #1f2937;
  line-height: 1.8;
  white-space: pre-wrap;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  padding: 14px;
  border-radius: 22px;
  background: #f8fafc;
}

.summary-label {
  color: #6b7280;
  font-size: 13px;
}

.summary-value {
  margin-top: 6px;
  color: #111827;
  font-weight: 700;
}

.text-list {
  font-size: 14px;
  line-height: 1.6;
}

.report-alert {
  margin-bottom: 16px;
}

.answer-item {
  padding: 16px;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.point-label {
  color: #374151;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .mock-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .report-summary {
    grid-template-columns: 1fr;
  }
}
</style>

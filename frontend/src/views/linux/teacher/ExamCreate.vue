<template>
  <div class="exam-create">
    <section class="module-heading">
      <div>
        <h1>{{ isEdit ? '编辑考试' : '创建考试' }}</h1>
        <p>设置考试时间、及格线、参与学员和题目来源，保存后会进入考试管理列表继续发布与维护。</p>
      </div>
      <div class="heading-actions">
        <el-button @click="goBack">返回考试管理</el-button>
      </div>
    </section>

    <el-form ref="formRef" :model="examForm" :rules="rules" label-width="120px" class="exam-form">
      <el-card class="form-section" shadow="never">
        <template #header>
          <span>基本信息</span>
        </template>

        <el-form-item label="考试名称" prop="title">
          <el-input
            v-model="examForm.title"
            placeholder="请输入考试名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="考试描述" prop="description">
          <el-input
            v-model="examForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入考试描述，可选"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="考试时间" prop="timeRange">
          <el-date-picker
            v-model="examForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTimeRange"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="考试时长" prop="duration">
          <el-slider v-model="examForm.duration" :min="30" :max="180" :step="10" show-stops />
          <span class="slider-value">{{ examForm.duration }} 分钟</span>
        </el-form-item>

        <el-form-item label="及格分数" prop="passingScore">
          <el-slider v-model="examForm.passingScore" :min="30" :max="100" :step="5" show-stops />
          <span class="slider-value">{{ examForm.passingScore }} 分</span>
        </el-form-item>

        <el-form-item label="参考学员">
          <el-select
            v-model="examForm.assignedStudentIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="不选择则默认全体学员可参加"
            style="width: 100%;"
          >
            <el-option
              v-for="student in students"
              :key="student.id"
              :label="`${student.real_name}（${student.username}）`"
              :value="student.id"
            />
          </el-select>
          <div class="field-tip">留空表示全体学生可参加；选择后仅名单内学员可见并可开始考试。</div>
        </el-form-item>
      </el-card>

      <el-card class="form-section" shadow="never">
        <template #header>
          <span>选题设置（共需要选择 50 道题）</span>
        </template>

        <el-form-item label="选题方式">
          <el-radio-group v-model="selectionType">
            <el-radio label="manual">手动选题</el-radio>
            <el-radio label="random">随机选题</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="selectionType === 'random'">
          <el-form-item label="题目类别">
            <el-checkbox-group v-model="examForm.selectedCategories">
              <el-checkbox v-for="(name, key) in categoryNames" :key="key" :label="key">
                {{ name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :disabled="examForm.selectedCategories.length === 0"
              @click="generateRandomQuestions"
            >
              生成随机题目
            </el-button>
            <span class="tip-text">将从选中的类别中随机选择 50 道题。</span>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="筛选条件">
            <el-select
              v-model="filter.category"
              placeholder="题目类别"
              clearable
              style="width: 180px; margin-right: 10px;"
            >
              <el-option
                v-for="(name, key) in categoryNames"
                :key="key"
                :label="name"
                :value="key"
              />
            </el-select>
            <el-select
              v-model="filter.type"
              placeholder="题目类型"
              clearable
              style="width: 180px; margin-right: 10px;"
            >
              <el-option label="选择题" value="choice" />
              <el-option label="判断题" value="truefalse" />
              <el-option label="填空题" value="fill" />
            </el-select>
            <el-button type="primary" @click="fetchQuestions">筛选</el-button>
          </el-form-item>

          <div class="question-selector">
            <div class="selector-header">
              <span>可选题目（共 {{ filteredQuestions.length }} 道）</span>
              <span>已选择 {{ selectedQuestionIds.length }} / 50</span>
            </div>

            <el-table
              ref="questionTable"
              :data="filteredQuestions"
              height="400"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column label="题目" min-width="320">
                <template #default="{ row }">
                  <div class="question-preview">
                    <el-tag size="small" :type="getQuestionTypeColor(row.type)" style="margin-right: 8px;">
                      {{ getQuestionTypeLabel(row.type) }}
                    </el-tag>
                    <el-tag size="small" type="info" style="margin-right: 8px;">
                      {{ categoryNames[row.category] || row.category }}
                    </el-tag>
                    <span class="question-text">{{ truncate(row.question, 50) }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>

        <div v-if="selectedQuestionIds.length > 0" class="selected-preview">
          <h4>已选题目（{{ selectedQuestionIds.length }} 道）</h4>
          <el-tag
            v-for="id in selectedQuestionIds.slice(0, 10)"
            :key="id"
            size="small"
            closable
            style="margin: 0 8px 8px 0;"
            @close="removeQuestion(id)"
          >
            题目 {{ id }}
          </el-tag>
          <el-tag v-if="selectedQuestionIds.length > 10" size="small" type="info">
            还有 {{ selectedQuestionIds.length - 10 }} 道…
          </el-tag>
        </div>
      </el-card>

      <div class="footer-actions">
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          :disabled="selectedQuestionIds.length !== 50"
          @click="submitExam"
        >
          {{ isEdit ? '保存修改' : '创建考试' }}
        </el-button>
        <el-button size="large" @click="goBack">取消</el-button>
        <span v-if="selectedQuestionIds.length !== 50" class="tip-text error">
          需要选择 50 道题，当前已选 {{ selectedQuestionIds.length }} 道
        </span>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import api from '../../../api'

type SelectionMode = 'manual' | 'random'

interface QuestionItem {
  id: number
  type: string
  category: string
  question: string
}

interface StudentItem {
  id: number
  username: string
  real_name: string
  role: string
}

interface ExamDetail {
  title: string
  description: string
  startTime: string
  endTime: string
  duration: number
  passingScore: number
  isRandom: boolean
  categories?: string[]
  questionIds?: number[]
  assignedStudentIds?: number[]
}

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)

const formRef = ref<FormInstance>()
const questionTable = ref<any>()
const submitting = ref(false)
const students = ref<StudentItem[]>([])

const defaultTimeRange = [
  new Date(2000, 0, 1, 9, 0, 0),
  new Date(2000, 0, 1, 17, 0, 0),
]

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

const examForm = reactive({
  title: '',
  description: '',
  timeRange: [] as string[],
  duration: 60,
  passingScore: 60,
  selectedCategories: [] as string[],
  assignedStudentIds: [] as number[],
})

const selectionType = ref<SelectionMode>('manual')
const filter = reactive({
  category: '',
  type: '',
})

const allQuestions = ref<QuestionItem[]>([])
const filteredQuestions = ref<QuestionItem[]>([])
const selectedQuestionIds = ref<number[]>([])

const rules: FormRules = {
  title: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择考试时间', trigger: 'change' }],
  duration: [{ required: true, message: '请设置考试时长', trigger: 'change' }],
}

function getQuestionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    choice: 'primary',
    truefalse: 'success',
    fill: 'warning',
  }
  return colors[type] || 'info'
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    choice: '选择题',
    truefalse: '判断题',
    fill: '填空题',
  }
  return labels[type] || type
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

async function fetchStudents() {
  try {
    const res = await api.get('/users')
    students.value = (res.data || []).filter((user: StudentItem) => user.role === 'student')
  } catch {
    ElMessage.error('获取学生列表失败')
  }
}

async function fetchQuestions() {
  try {
    const res = await api.get('/linux-exam/question-bank', {
      params: { category: filter.category || undefined, type: filter.type || undefined },
    })
    allQuestions.value = res.data.data
    filteredQuestions.value = allQuestions.value
    syncTableSelection()
  } catch {
    ElMessage.error('获取题库失败')
  }
}

function handleSelectionChange(selection: QuestionItem[]) {
  const filteredQuestionIds = new Set(filteredQuestions.value.map((item) => item.id))
  const preserved = selectedQuestionIds.value.filter((id) => !filteredQuestionIds.has(id))
  selectedQuestionIds.value = [...preserved, ...selection.map((item) => item.id)]
}

function generateRandomQuestions() {
  if (examForm.selectedCategories.length === 0) {
    ElMessage.warning('请至少选择一个类别')
    return
  }

  const categoryQuestions = allQuestions.value.filter((question) =>
    examForm.selectedCategories.includes(question.category),
  )

  if (categoryQuestions.length < 50) {
    ElMessage.warning(`选中的类别中只有 ${categoryQuestions.length} 道题，不足 50 道`)
    return
  }

  const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5)
  selectedQuestionIds.value = shuffled.slice(0, 50).map((question) => question.id)
  ElMessage.success('已随机选择 50 道题目')
}

function removeQuestion(id: number) {
  selectedQuestionIds.value = selectedQuestionIds.value.filter((questionId) => questionId !== id)
  syncTableSelection()
}

function syncTableSelection() {
  if (!questionTable.value?.clearSelection) return

  questionTable.value.clearSelection()
  filteredQuestions.value.forEach((question) => {
    if (selectedQuestionIds.value.includes(question.id)) {
      questionTable.value.toggleRowSelection(question, true)
    }
  })
}

async function submitExam() {
  if (selectedQuestionIds.value.length !== 50) {
    ElMessage.warning('请选择 50 道题目')
    return
  }

  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = {
      title: examForm.title,
      description: examForm.description,
      questionIds: selectedQuestionIds.value,
      categories: selectionType.value === 'random' ? examForm.selectedCategories : [],
      assignedStudentIds: examForm.assignedStudentIds,
      isRandom: selectionType.value === 'random',
      startTime: examForm.timeRange[0],
      endTime: examForm.timeRange[1],
      duration: examForm.duration,
      passingScore: examForm.passingScore,
    }

    if (isEdit.value) {
      await api.put(`/linux-exam/exams/${route.params.id}`, payload)
      ElMessage.success('修改成功')
    } else {
      await api.post('/linux-exam/exams', payload)
      ElMessage.success('创建成功')
    }

    router.push('/admin/exams')
  } catch {
    ElMessage.error(isEdit.value ? '修改失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.push('/admin/exams')
}

async function loadExamDetail() {
  if (!isEdit.value) return

  try {
    const res = await api.get(`/linux-exam/exams/${route.params.id}`)
    const exam: ExamDetail = res.data.data

    examForm.title = exam.title
    examForm.description = exam.description || ''
    examForm.timeRange = [exam.startTime, exam.endTime]
    examForm.duration = exam.duration
    examForm.passingScore = exam.passingScore
    examForm.assignedStudentIds = exam.assignedStudentIds || []
    selectionType.value = exam.isRandom ? 'random' : 'manual'
    examForm.selectedCategories = exam.categories || []
    selectedQuestionIds.value = exam.questionIds || []
    syncTableSelection()
  } catch {
    ElMessage.error('加载考试详情失败')
  }
}

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchQuestions()])
  await loadExamDetail()
})
</script>

<style scoped>
.exam-create {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.module-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
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

.heading-actions {
  display: flex;
  gap: 12px;
}

.exam-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-section {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.slider-value {
  margin-left: 16px;
  color: #3370ff;
  font-weight: 500;
}

.tip-text {
  margin-left: 16px;
  color: #909399;
  font-size: 14px;
}

.tip-text.error {
  color: #f56c6c;
}

.field-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.question-selector {
  border: 1px solid #e5eaf3;
  border-radius: 22px;
  padding: 16px;
  margin-top: 16px;
  background: rgba(248, 250, 252, 0.72);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.question-preview {
  display: flex;
  align-items: center;
}

.question-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-preview {
  margin-top: 20px;
  padding: 16px;
  background: rgba(245, 247, 250, 0.88);
  border-radius: 22px;
}

.selected-preview h4 {
  margin: 0 0 12px;
  color: #1f2329;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 900px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

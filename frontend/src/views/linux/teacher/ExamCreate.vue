<template>
  <div class="exam-create">
    <section class="module-heading">
      <div>
        <h1>{{ isEditMode ? '编辑考试' : '创建考试' }}</h1>
        <p>设置考试时间、时长、及格分数和题目来源，支持指定学员参加，并可从 Nginx、Redis、Docker 等分类中选题。</p>
      </div>
      <div class="heading-actions">
        <el-button @click="goBack">返回考试管理</el-button>
      </div>
    </section>

    <div class="layout-grid">
      <el-card class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基础设置</span>
            <el-tag type="info" effect="plain">{{ isEditMode ? '编辑模式' : '新建模式' }}</el-tag>
          </div>
        </template>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="exam-form"
        >
          <el-form-item label="考试名称" prop="title">
            <el-input v-model="form.title" maxlength="100" show-word-limit placeholder="例如：Docker 运维基础测验" />
          </el-form-item>

          <el-form-item label="考试说明" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="可填写考试范围、作答须知和参考建议。"
            />
          </el-form-item>

          <div class="form-row two-columns">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="选择开始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </div>

          <div class="form-row three-columns">
            <el-form-item label="考试时长（分钟）" prop="duration">
              <el-input-number v-model="form.duration" :min="10" :max="240" :step="5" style="width: 100%" />
            </el-form-item>
            <el-form-item label="及格分数" prop="passingScore">
              <el-input-number v-model="form.passingScore" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
            <el-form-item label="选题方式" prop="isRandom">
              <el-select v-model="form.isRandom" style="width: 100%">
                <el-option :value="false" label="手动选题" />
                <el-option :value="true" label="随机组卷" />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="参考学员">
            <el-select
              v-model="form.assignedStudentIds"
              multiple
              filterable
              clearable
              collapse-tags
              collapse-tags-tooltip
              placeholder="不选择则默认全部学员可参加"
              style="width: 100%"
            >
              <el-option
                v-for="student in students"
                :key="student.id"
                :label="`${student.realName || student.username}（${student.username}）`"
                :value="student.id"
              />
            </el-select>
            <div class="field-tip">留空表示全体学员可见并可参加考试。</div>
          </el-form-item>

          <div class="submit-actions">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" :loading="saving" @click="submitForm">
              {{ isEditMode ? '保存修改' : '创建考试' }}
            </el-button>
          </div>
        </el-form>
      </el-card>

      <el-card class="question-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>题库与组卷</span>
            <el-tag :type="selectedQuestionIds.length === 50 ? 'success' : 'warning'" effect="dark">
              已选 {{ selectedQuestionIds.length }} / 50 题
            </el-tag>
          </div>
        </template>

        <div class="toolbar">
          <el-select v-model="selectedCategories" multiple collapse-tags collapse-tags-tooltip placeholder="筛选分类" style="min-width: 260px">
            <el-option
              v-for="category in availableCategories"
              :key="category"
              :label="getCategoryName(category)"
              :value="category"
            />
          </el-select>

          <el-select v-model="selectedType" clearable placeholder="题型" style="width: 150px">
            <el-option label="全部题型" value="" />
            <el-option label="选择题" value="choice" />
            <el-option label="判断题" value="truefalse" />
            <el-option label="填空题" value="fill" />
          </el-select>

          <el-input v-model="keyword" clearable placeholder="搜索题目内容" style="min-width: 260px" />

          <div class="toolbar-actions">
            <el-button @click="clearSelectedQuestions">清空已选</el-button>
            <el-button type="primary" @click="autoPickQuestions">
              {{ form.isRandom ? '重新随机组卷' : '从当前筛选补齐 50 题' }}
            </el-button>
          </div>
        </div>

        <div class="summary-strip">
          <div class="summary-item">
            <span class="summary-label">当前筛选题数</span>
            <strong>{{ filteredQuestions.length }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">分类</span>
            <strong>{{ selectedCategories.length ? selectedCategories.map(getCategoryName).join(' / ') : '全部' }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">组卷方式</span>
            <strong>{{ form.isRandom ? '随机组卷' : '手动选题' }}</strong>
          </div>
        </div>

        <el-table
          ref="questionTableRef"
          :data="filteredQuestions"
          height="560"
          class="question-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="52" :selectable="isSelectableQuestion" />
          <el-table-column label="题目" min-width="420">
            <template #default="{ row }">
              <div class="question-text">{{ row.question }}</div>
            </template>
          </el-table-column>
          <el-table-column label="分类" width="150">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ getCategoryName(row.category) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="题型" width="110">
            <template #default="{ row }">
              {{ getQuestionTypeLabel(row.type) }}
            </template>
          </el-table-column>
          <el-table-column label="ID" width="90" prop="id" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules, type TableInstance } from 'element-plus'
import api from '../../../api'

type QuestionRecord = {
  id: number
  category: string
  type: string
  question: string
}

type StudentRecord = {
  id: number
  username: string
  realName?: string
  role?: string
}

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const questionTableRef = ref<TableInstance>()
const saving = ref(false)
const loadingQuestions = ref(false)
const allQuestions = ref<QuestionRecord[]>([])
const students = ref<StudentRecord[]>([])
const keyword = ref('')
const selectedType = ref('')
const selectedCategories = ref<string[]>([])
const selectedQuestionIds = ref<number[]>([])

const examId = computed(() => Number(route.params.id))
const isEditMode = computed(() => Number.isFinite(examId.value) && examId.value > 0)

const form = reactive({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  duration: 60,
  passingScore: 60,
  isRandom: false,
  assignedStudentIds: [] as number[],
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  duration: [{ required: true, message: '请输入考试时长', trigger: 'change' }],
  passingScore: [{ required: true, message: '请输入及格分数', trigger: 'change' }],
}

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
  nginx: 'Nginx 学习',
  redis: 'Redis 学习',
  docker: 'Docker 学习',
}

const availableCategories = computed(() => {
  const categories = new Set(allQuestions.value.map((question) => question.category))
  return Array.from(categories)
})

const filteredQuestions = computed(() => {
  return allQuestions.value.filter((question) => {
    if (selectedCategories.value.length && !selectedCategories.value.includes(question.category)) {
      return false
    }
    if (selectedType.value && question.type !== selectedType.value) {
      return false
    }
    if (keyword.value.trim()) {
      return question.question.toLowerCase().includes(keyword.value.trim().toLowerCase())
    }
    return true
  })
})

function getCategoryName(category: string) {
  return categoryNames[category] || category
}

function getQuestionTypeLabel(type: string) {
  if (type === 'choice') return '选择题'
  if (type === 'truefalse') return '判断题'
  if (type === 'fill') return '填空题'
  return type
}

function goBack() {
  router.push('/admin/exams')
}

function clearSelectedQuestions() {
  selectedQuestionIds.value = []
  syncTableSelection()
}

function isSelectableQuestion(row: QuestionRecord) {
  return selectedQuestionIds.value.includes(row.id) || selectedQuestionIds.value.length < 50
}

function handleSelectionChange(rows: QuestionRecord[]) {
  const visibleIds = new Set(filteredQuestions.value.map((item) => item.id))
  const hiddenSelected = selectedQuestionIds.value.filter((id) => !visibleIds.has(id))
  const nextIds = [...hiddenSelected, ...rows.map((row) => row.id)]
  selectedQuestionIds.value = Array.from(new Set(nextIds)).slice(0, 50)

  if (rows.length + hiddenSelected.length > 50) {
    ElMessage.warning('考试必须固定为 50 题，多余题目已自动忽略。')
    syncTableSelection()
  }
}

function autoPickQuestions() {
  const source = [...filteredQuestions.value]
  if (source.length < 50) {
    ElMessage.warning('当前筛选条件下不足 50 题，请放宽分类或题型后再试。')
    return
  }

  const shuffled = source.sort(() => Math.random() - 0.5).slice(0, 50)
  selectedQuestionIds.value = shuffled.map((item) => item.id)
  syncTableSelection()
  ElMessage.success(form.isRandom ? '已重新随机生成 50 题试卷' : '已从当前筛选条件中补齐 50 题')
}

async function syncTableSelection() {
  await nextTick()
  const table = questionTableRef.value
  if (!table) return

  table.clearSelection()
  const selectedSet = new Set(selectedQuestionIds.value)
  filteredQuestions.value.forEach((row) => {
    if (selectedSet.has(row.id)) {
      table.toggleRowSelection(row, true)
    }
  })
}

async function fetchStudents() {
  try {
    const res = await api.get('/users', { params: { page: 1, limit: 500 } })
    const rows = res.data?.data || []
    students.value = rows
      .filter((item: StudentRecord) => item.role !== 'admin')
      .map((item: StudentRecord) => ({
        id: item.id,
        username: item.username,
        realName: item.realName,
        role: item.role,
      }))
  } catch {
    ElMessage.error('获取学员列表失败')
  }
}

async function fetchQuestionBank() {
  loadingQuestions.value = true
  try {
    const res = await api.get('/linux-exam/question-bank')
    allQuestions.value = res.data?.data || []
  } catch {
    ElMessage.error('获取题库失败')
  } finally {
    loadingQuestions.value = false
  }
}

async function fetchExamDetail() {
  if (!isEditMode.value) return

  try {
    const res = await api.get(`/linux-exam/exams/${examId.value}`)
    const detail = res.data?.data
    if (!detail) return

    form.title = detail.title || ''
    form.description = detail.description || ''
    form.startTime = detail.startTime || ''
    form.endTime = detail.endTime || ''
    form.duration = Number(detail.duration || 60)
    form.passingScore = Number(detail.passingScore || 60)
    form.isRandom = Boolean(detail.isRandom)
    form.assignedStudentIds = Array.isArray(detail.assignedStudentIds) ? detail.assignedStudentIds : []
    selectedQuestionIds.value = Array.isArray(detail.questionIds) ? detail.questionIds : []
    selectedCategories.value = Array.isArray(detail.categories) ? detail.categories : []
    await syncTableSelection()
  } catch {
    ElMessage.error('获取考试详情失败')
  }
}

async function submitForm() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (selectedQuestionIds.value.length !== 50) {
      ElMessage.warning('考试必须固定为 50 题，请先补齐题目。')
      return
    }

    saving.value = true
    try {
      const payload = {
        title: form.title,
        description: form.description,
        questionIds: selectedQuestionIds.value,
        categories: selectedCategories.value.length
          ? selectedCategories.value
          : Array.from(new Set(allQuestions.value.filter((q) => selectedQuestionIds.value.includes(q.id)).map((q) => q.category))),
        assignedStudentIds: form.assignedStudentIds,
        isRandom: form.isRandom,
        startTime: form.startTime,
        endTime: form.endTime,
        duration: form.duration,
        passingScore: form.passingScore,
      }

      if (isEditMode.value) {
        await api.put(`/linux-exam/exams/${examId.value}`, payload)
        ElMessage.success('考试已更新')
      } else {
        await api.post('/linux-exam/exams', payload)
        ElMessage.success('考试已创建')
      }

      goBack()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || (isEditMode.value ? '更新考试失败' : '创建考试失败'))
    } finally {
      saving.value = false
    }
  })
}

watch([filteredQuestions, selectedQuestionIds], () => {
  syncTableSelection()
})

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchQuestionBank()])
  await fetchExamDetail()
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
  max-width: 840px;
  color: #627089;
  font-size: 13px;
  line-height: 1.65;
}

.heading-actions {
  display: flex;
  gap: 12px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr);
  gap: 20px;
}

.form-card,
.question-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.exam-form {
  margin-top: 4px;
}

.form-row {
  display: grid;
  gap: 14px;
}

.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.three-columns {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field-tip {
  margin-top: 8px;
  color: #7b8aa3;
  font-size: 12px;
}

.submit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-item {
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.86);
}

.summary-label {
  display: block;
  color: #7b8aa3;
  font-size: 12px;
  margin-bottom: 6px;
}

.summary-item strong {
  color: #16233b;
  font-size: 14px;
}

.question-text {
  color: #16233b;
  line-height: 1.6;
}

.question-table :deep(.el-table__row .el-checkbox.is-disabled) {
  opacity: 0.45;
}

@media (max-width: 1200px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .two-columns,
  .three-columns,
  .summary-strip {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

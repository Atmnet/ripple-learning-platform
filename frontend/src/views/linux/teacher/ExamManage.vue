<template>
  <div class="exam-manage">
    <section class="module-heading">
      <div>
        <h1>考试管理</h1>
        <p>统一查看考试列表、发布时间、状态和成绩统计，并继续进入详情或创建新考试。</p>
      </div>
      <div class="heading-actions">
        <el-button type="primary" @click="createExam">创建考试</el-button>
      </div>
    </section>

    <section class="overview-grid">
      <article class="overview-card">
        <div class="overview-value">{{ total }}</div>
        <div class="overview-label">考试总数</div>
      </article>
      <article class="overview-card">
        <div class="overview-value">{{ publishedCount }}</div>
        <div class="overview-label">已发布</div>
      </article>
      <article class="overview-card">
        <div class="overview-value">{{ draftCount }}</div>
        <div class="overview-label">草稿</div>
      </article>
    </section>

    <el-card class="table-card" shadow="never">
      <el-table :data="exams" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="考试名称" min-width="200" />
        <el-table-column label="考试时间" min-width="280">
          <template #default="{ row }">
            <div>{{ formatDate(row.startTime) }}</div>
            <div class="sub-time">{{ formatDate(row.endTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="100">
          <template #default="{ row }">{{ row.duration }} 分钟</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'draft'" link type="success" @click="publishExam(row)">发布</el-button>
            <el-button v-if="row.status === 'published'" link type="warning" @click="endExam(row)">结束</el-button>
            <el-button link type="primary" @click="viewResults(row)">成绩</el-button>
            <el-button link type="danger" @click="deleteExam(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="limit"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="fetchExams"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="考试详情" width="640px">
      <div v-if="currentExam" class="exam-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="考试名称">{{ currentExam.title }}</el-descriptions-item>
          <el-descriptions-item label="考试描述">{{ currentExam.description || '暂无描述' }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDate(currentExam.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDate(currentExam.endTime) }}</el-descriptions-item>
          <el-descriptions-item label="考试时长">{{ currentExam.duration }} 分钟</el-descriptions-item>
          <el-descriptions-item label="题目数量">{{ currentExam.totalQuestions }} 题</el-descriptions-item>
          <el-descriptions-item label="及格分数">{{ currentExam.passingScore }} 分</el-descriptions-item>
          <el-descriptions-item label="选题方式">
            {{ currentExam.isRandom ? '随机选题' : '手动选题' }}
          </el-descriptions-item>
          <el-descriptions-item label="包含类别">
            <el-tag
              v-for="cat in currentExam.categories"
              :key="cat"
              size="small"
              style="margin-right: 8px;"
            >
              {{ getCategoryName(cat) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="参考学员">
            {{ currentExam.assignedStudentIds?.length ? `指定 ${currentExam.assignedStudentIds.length} 名学员` : '全体学员' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-dialog v-model="resultsVisible" title="考试成绩统计" width="960px">
      <div v-if="examResults" class="exam-results">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ examResults.stats.total }}</div>
            <div class="stat-label">参考人数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ examResults.stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ examResults.stats.averageScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
        </div>

        <el-table :data="examResults.data" style="margin-top: 20px;">
          <el-table-column label="学员姓名" min-width="140">
            <template #default="{ row }">
              {{ row.studentName || row.username || `学员#${row.studentId}` }}
            </template>
          </el-table-column>
          <el-table-column prop="username" label="账号" min-width="140" />
          <el-table-column prop="studentId" label="学员 ID" width="100" />
          <el-table-column prop="score" label="分数" width="100">
            <template #default="{ row }">
              <span :class="getScoreClass(Number(row.score || 0))">{{ row.score ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="correctCount" label="正确数" width="100" />
          <el-table-column prop="wrongCount" label="错误数" width="100" />
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'info'">
                {{ row.status === 'completed' ? '已完成' : '进行中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="完成时间" min-width="180">
            <template #default="{ row }">
              {{ row.endTime ? formatDate(row.endTime) : '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../../api'
import { formatDateTimeText } from '../../../utils/dateTime'

const router = useRouter()
const loading = ref(false)
const exams = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const detailVisible = ref(false)
const currentExam = ref<any | null>(null)

const resultsVisible = ref(false)
const examResults = ref<any | null>(null)

const publishedCount = computed(() => exams.value.filter((exam: any) => exam.status === 'published').length)
const draftCount = computed(() => exams.value.filter((exam: any) => exam.status === 'draft').length)

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

function getCategoryName(key: string): string {
  return categoryNames[key] || key
}

function formatDate(date: string | Date): string {
  return formatDateTimeText(date)
}

function getStatusType(status: string): string {
  const types: Record<string, string> = {
    draft: 'info',
    published: 'success',
    ended: 'danger',
  }
  return types[status] || 'info'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    ended: '已结束',
  }
  return texts[status] || status
}

function getScoreClass(score: number): string {
  if (score >= 90) return 'score-excellent'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

async function fetchExams() {
  loading.value = true
  try {
    const res = await api.get('/linux-exam/exams', {
      params: { page: page.value, limit: limit.value },
    })
    exams.value = res.data.data
    total.value = res.data.total
  } catch {
    ElMessage.error('获取考试列表失败')
  } finally {
    loading.value = false
  }
}

function createExam() {
  router.push('/admin/exams/create')
}

function viewDetail(exam: any) {
  currentExam.value = exam
  detailVisible.value = true
}

async function publishExam(exam: any) {
  try {
    await ElMessageBox.confirm('确定要发布这场考试吗？', '提示', { type: 'warning' })
    await api.post(`/linux-exam/exams/${exam.id}/publish`)
    ElMessage.success('发布成功')
    fetchExams()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败')
    }
  }
}

async function endExam(exam: any) {
  try {
    await ElMessageBox.confirm('确定要结束这场考试吗？', '提示', { type: 'warning' })
    await api.post(`/linux-exam/exams/${exam.id}/end`)
    ElMessage.success('考试已结束')
    fetchExams()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

async function deleteExam(exam: any) {
  try {
    await ElMessageBox.confirm('确定要删除这场考试吗？删除后不可恢复。', '警告', {
      type: 'error',
      confirmButtonClass: 'el-button--danger',
    })
    await api.delete(`/linux-exam/exams/${exam.id}`)
    ElMessage.success('删除成功')
    fetchExams()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

async function viewResults(exam: any) {
  try {
    const res = await api.get(`/linux-exam/exams/${exam.id}/results`)
    examResults.value = res.data
    resultsVisible.value = true
  } catch {
    ElMessage.error('获取成绩失败')
  }
}

onMounted(fetchExams)
</script>

<style scoped>
.exam-manage {
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.overview-card {
  padding: 22px;
  border-radius: 28px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 32px rgba(148, 163, 184, 0.12);
  text-align: center;
}

.overview-value {
  color: #409eff;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
}

.overview-label {
  color: #606266;
  font-size: 14px;
  margin-top: 8px;
}

.table-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.sub-time {
  margin-top: 4px;
  color: #64748b;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.exam-detail {
  padding: 10px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f5f7fa;
  border-radius: 18px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #3370ff;
  margin-bottom: 8px;
}

.stat-label {
  color: #646a73;
  font-size: 14px;
}

.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-pass {
  color: #e6a23c;
}

.score-fail {
  color: #f56c6c;
}

@media (max-width: 900px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .overview-grid,
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>

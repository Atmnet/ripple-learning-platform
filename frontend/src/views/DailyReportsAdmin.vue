<template>
  <div class="daily-reports-admin">
    <section class="module-heading">
      <div>
        <h1>日报管理</h1>
        <p>查看指定日期的日报提交情况，并在当前页面内完成日报详情查看和评论反馈。</p>
      </div>
      <div class="heading-actions">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="false"
          @change="handleDateChange"
        />
        <el-button type="primary" :loading="loading" @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </section>

    <section class="stats-row" v-loading="loading">
      <article class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">学员总数</div>
      </article>
      <article class="stat-card submitted">
        <div class="stat-value">{{ stats.submitted }}</div>
        <div class="stat-label">已提交</div>
      </article>
      <article class="stat-card unsubmitted">
        <div class="stat-value">{{ stats.unsubmitted }}</div>
        <div class="stat-label">未提交</div>
      </article>
    </section>

    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="list-header">
          <div>
            <div class="list-title">学员日报状态</div>
            <div class="list-subtitle">{{ selectedDate }} 的提交情况</div>
          </div>
          <el-radio-group v-model="filterStatus" size="small" @change="syncRouteState">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="submitted">已提交</el-radio-button>
            <el-radio-button label="unsubmitted">未提交</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="filteredList" style="width: 100%" v-loading="loading">
        <el-table-column prop="real_name" label="学员姓名" min-width="120" />
        <el-table-column prop="username" label="账号" min-width="120" />
        <el-table-column label="提交状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.has_submitted ? 'success' : 'warning'">
              {{ row.has_submitted ? '已提交' : '未提交' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已阅状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.is_reviewed" type="success" size="small">已阅</el-tag>
            <el-tag v-else-if="row.has_submitted" type="info" size="small">未阅</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="评论数" width="100">
          <template #default="{ row }">
            <el-badge :value="row.comment_count" :hidden="row.comment_count === 0" type="primary">
              <el-tag size="small" effect="plain">{{ row.comment_count }} 条</el-tag>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" min-width="180">
          <template #default="{ row }">
            {{ row.created_at ? formatDateTime(row.created_at) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.has_submitted" type="primary" link @click="openReportDialog(row)">
              查看详情
            </el-button>
            <span v-else class="no-action">-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="reportDialogVisible"
      class="report-dialog"
      width="920px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="dialog-heading">
          <div>
            <h2>日报详情</h2>
            <p>{{ activeReportMeta.real_name || '-' }} · {{ selectedDate }}</p>
          </div>
          <div class="dialog-heading-tags">
            <el-tag v-if="activeReport.reviewed_at" type="success">已阅</el-tag>
            <el-tag v-else type="warning">待查看</el-tag>
          </div>
        </div>
      </template>

      <div v-loading="reportDialogLoading" class="dialog-content">
        <section class="report-summary-card">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">学员</span>
              <strong>{{ activeReportMeta.real_name || '-' }}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">账号</span>
              <strong>{{ activeReportMeta.username || '-' }}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">提交日期</span>
              <strong>{{ formatDate(activeReport.submit_date) }}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">提交时间</span>
              <strong>{{ formatDateTime(activeReport.created_at) }}</strong>
            </div>
          </div>

          <div class="report-content-block">
            <div class="section-title">日报内容</div>
            <div class="content-box">
              <pre>{{ activeReport.content || '暂无内容' }}</pre>
            </div>
          </div>
        </section>

        <section class="comments-panel">
          <div class="section-bar">
            <div>
              <div class="section-title">评论与反馈</div>
              <div class="section-subtitle">在当前弹窗内即可完成批注和跟进。</div>
            </div>
            <el-tag effect="plain">共 {{ activeComments.length }} 条</el-tag>
          </div>

          <div v-if="activeComments.length === 0" class="empty-comments">
            暂无评论，您可以先给这份日报留下反馈。
          </div>
          <div v-else class="comments-list">
            <article v-for="comment in activeComments" :key="comment.id" class="comment-card">
              <div class="comment-header">
                <div class="comment-user">
                  <el-avatar :size="32" :icon="UserFilled" />
                  <div>
                    <strong>{{ comment.user_name }}</strong>
                    <div class="comment-meta">
                      <span>{{ comment.user_role === 'admin' ? '老师' : '学员' }}</span>
                      <span>{{ formatDateTime(comment.created_at) }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="comment.user_id === currentUserId && !comment.isEditing" class="comment-actions">
                  <el-button type="primary" link size="small" @click="startEditComment(comment)">编辑</el-button>
                  <el-button type="danger" link size="small" @click="handleDeleteComment(comment.id)">删除</el-button>
                </div>
              </div>

              <div v-if="!comment.isEditing" class="comment-body">
                {{ comment.content }}
              </div>
              <div v-else class="comment-edit">
                <el-input v-model="comment.editContent" type="textarea" :rows="3" placeholder="编辑评论内容" />
                <div class="edit-actions">
                  <el-button type="primary" size="small" @click="saveEditComment(comment)">保存</el-button>
                  <el-button size="small" @click="cancelEditComment(comment)">取消</el-button>
                </div>
              </div>
            </article>
          </div>

          <div class="comment-form">
            <div class="section-title">新增评论</div>
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="4"
              placeholder="输入对这份日报的反馈、建议或追问"
              maxlength="500"
              show-word-limit
            />
            <div class="form-actions">
              <el-button @click="reportDialogVisible = false">关闭</el-button>
              <el-button type="primary" :loading="commentSubmitting" @click="submitComment">发表评论</el-button>
            </div>
          </div>
        </section>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, UserFilled } from '@element-plus/icons-vue'
import api from '../api'
import { useAuthStore } from '../stores/auth'

type DailyStatusRow = {
  report_id?: number
  real_name?: string
  username?: string
  has_submitted?: boolean
  is_reviewed?: boolean
  comment_count?: number
  created_at?: string
}

type DailyComment = {
  id: number
  user_id: number
  user_name: string
  user_role: string
  content: string
  created_at: string
  isEditing?: boolean
  editContent?: string
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const reportDialogVisible = ref(false)
const reportDialogLoading = ref(false)
const commentSubmitting = ref(false)

const getLocalDateString = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const getQueryString = (value: unknown) => (typeof value === 'string' ? value : '')
const getInitialStatus = (value: unknown) => {
  const status = getQueryString(value)
  return ['all', 'submitted', 'unsubmitted'].includes(status) ? status : 'all'
}

const selectedDate = ref(getQueryString(route.query.date) || getLocalDateString())
const filterStatus = ref(getInitialStatus(route.query.status))

const stats = ref({
  total: 0,
  submitted: 0,
  unsubmitted: 0,
})

const userList = ref<DailyStatusRow[]>([])
const activeReport = ref({
  id: '',
  content: '',
  submit_date: '',
  created_at: '',
  updated_at: '',
  reviewed_at: '',
})
const activeReportMeta = ref<DailyStatusRow>({})
const activeComments = ref<DailyComment[]>([])
const newComment = ref('')

const currentUserId = computed(() => authStore.user?.id || 0)

const filteredList = computed(() => {
  if (filterStatus.value === 'all') return userList.value
  if (filterStatus.value === 'submitted') return userList.value.filter((u) => u.has_submitted)
  return userList.value.filter((u) => !u.has_submitted)
})

const formatDate = (dateString?: string) => (!dateString ? '-' : new Date(dateString).toLocaleDateString('zh-CN'))
const formatDateTime = (dateString?: string) => (!dateString ? '-' : new Date(dateString).toLocaleString('zh-CN'))

const loadData = async () => {
  loading.value = true
  try {
    const response = await api.get(`/daily-reports/admin/status?date=${selectedDate.value}`)
    stats.value = {
      total: response.data.total,
      submitted: response.data.submitted,
      unsubmitted: response.data.unsubmitted,
    }
    userList.value = response.data.list
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '加载日报管理数据失败')
  } finally {
    loading.value = false
  }
}

const syncRouteState = () => {
  router.replace({
    path: '/admin/daily-reports',
    query: {
      date: selectedDate.value,
      status: filterStatus.value,
    },
  })
}

const handleDateChange = () => {
  syncRouteState()
  loadData()
}

const fetchComments = async (reportId: number) => {
  const response = await api.get(`/daily-reports/${reportId}/comments`)
  activeComments.value = response.data.map((comment: DailyComment) => ({
    ...comment,
    isEditing: false,
    editContent: '',
  }))
}

const openReportDialog = async (row: DailyStatusRow) => {
  if (!row.report_id) return
  reportDialogVisible.value = true
  reportDialogLoading.value = true
  activeReportMeta.value = row
  newComment.value = ''

  try {
    const response = await api.get(`/daily-reports/${row.report_id}`)
    activeReport.value = response.data
    await fetchComments(row.report_id)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '加载日报详情失败')
    reportDialogVisible.value = false
  } finally {
    reportDialogLoading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim() || !activeReport.value.id) {
    ElMessage.warning('请输入评论内容')
    return
  }

  commentSubmitting.value = true
  try {
    await api.post(`/daily-reports/${activeReport.value.id}/comments`, {
      content: newComment.value.trim(),
    })
    ElMessage.success('评论发表成功')
    newComment.value = ''
    await fetchComments(Number(activeReport.value.id))
    await loadData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '评论发表失败')
  } finally {
    commentSubmitting.value = false
  }
}

const startEditComment = (comment: DailyComment) => {
  comment.isEditing = true
  comment.editContent = comment.content
}

const cancelEditComment = (comment: DailyComment) => {
  comment.isEditing = false
  comment.editContent = ''
}

const saveEditComment = async (comment: DailyComment) => {
  if (!comment.editContent?.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    await api.put(`/daily-reports/${activeReport.value.id}/comments/${comment.id}`, {
      content: comment.editContent.trim(),
    })
    ElMessage.success('评论修改成功')
    comment.content = comment.editContent
    comment.isEditing = false
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '评论修改失败')
  }
}

const handleDeleteComment = async (commentId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await api.delete(`/daily-reports/comments/${commentId}`)
    ElMessage.success('评论删除成功')
    await fetchComments(Number(activeReport.value.id))
    await loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '评论删除失败')
    }
  }
}

onMounted(() => {
  syncRouteState()
  loadData()
})
</script>

<style scoped>
.daily-reports-admin {
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
  max-width: 700px;
  color: #627089;
  font-size: 13px;
  line-height: 1.65;
}

.heading-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  padding: 22px;
  border-radius: 28px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 32px rgba(148, 163, 184, 0.12);
  text-align: center;
}

.stat-card.submitted {
  background-image: linear-gradient(145deg, rgba(241, 255, 248, 0.7), rgba(225, 255, 239, 0.22));
}

.stat-card.unsubmitted {
  background-image: linear-gradient(145deg, rgba(255, 250, 241, 0.72), rgba(255, 240, 214, 0.2));
}

.stat-value {
  color: #22324c;
  font-size: 34px;
  font-weight: 800;
}

.stat-label {
  margin-top: 8px;
  color: #627089;
  font-size: 13px;
}

.list-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.list-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.list-title {
  color: #16233b;
  font-size: 18px;
  font-weight: 800;
}

.list-subtitle {
  margin-top: 6px;
  color: #627089;
  font-size: 13px;
}

.no-action {
  color: #a0aec0;
}

:deep(.report-dialog) {
  border-radius: 30px;
}

:deep(.report-dialog .el-dialog__body) {
  padding-top: 10px;
}

.dialog-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.dialog-heading h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #16233b;
}

.dialog-heading p {
  margin: 6px 0 0;
  color: #627089;
  font-size: 13px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.report-summary-card,
.comments-panel {
  padding: 22px;
  border-radius: 24px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(235, 240, 248, 0.92);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-item {
  padding: 14px 16px;
  border-radius: 18px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  color: #7b8aa3;
  font-size: 12px;
}

.summary-item strong {
  color: #1f2e46;
  font-size: 14px;
}

.report-content-block {
  margin-top: 18px;
}

.section-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.section-title {
  color: #16233b;
  font-size: 16px;
  font-weight: 800;
}

.section-subtitle {
  margin-top: 6px;
  color: #627089;
  font-size: 13px;
}

.content-box {
  margin-top: 12px;
  padding: 18px;
  border-radius: 20px;
  background: #fff;
}

.content-box pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #334155;
  font-family: inherit;
  line-height: 1.7;
}

.empty-comments {
  padding: 20px 18px;
  border-radius: 18px;
  background: #fff;
  color: #627089;
  font-size: 13px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment-card {
  padding: 16px;
  border-radius: 20px;
  background: #fff;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-user strong {
  display: block;
  color: #22324c;
}

.comment-meta {
  display: flex;
  gap: 10px;
  color: #7b8aa3;
  font-size: 12px;
  margin-top: 4px;
}

.comment-body {
  margin-top: 12px;
  color: #334155;
  line-height: 1.7;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-edit {
  margin-top: 12px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-form {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

@media (max-width: 960px) {
  .module-heading,
  .list-header,
  .dialog-heading,
  .section-bar,
  .comment-header {
    flex-direction: column;
    align-items: stretch;
  }

  .heading-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .stats-row,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

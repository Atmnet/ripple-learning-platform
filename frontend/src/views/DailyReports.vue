<template>
  <div class="daily-reports-page">
    <section class="daily-heading">
      <div>
        <h1>日报中心</h1>
        <p>每天的总结与反馈，积累成长。</p>
      </div>
      <el-button type="primary" class="create-button" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新建日报
      </el-button>
    </section>

    <section class="reports-shell">
      <div class="toolbar-row">
        <div class="search-field">
          <el-icon><Search /></el-icon>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索日报..."
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="toolbar-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
          <el-button class="ghost-button" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <div v-if="!isMobile" class="reports-table-wrap">
        <table class="reports-table">
          <thead>
            <tr>
              <th>日报标题</th>
              <th>日期</th>
              <th v-if="isAdmin">创建者</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id">
              <td>
                <div class="title-cell">
                  <strong>{{ buildReportTitle(report) }}</strong>
                  <span>{{ buildPreview(report.content) }}</span>
                </div>
              </td>
              <td>{{ formatDate(report.submit_date) }}</td>
              <td v-if="isAdmin">{{ report.user_name || '-' }}</td>
              <td>
                <span class="status-chip" :class="getStatusClass(report)">
                  {{ getStatusText(report) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="icon-button" type="button" title="查看" @click="viewReport(report)">
                    <el-icon><View /></el-icon>
                  </button>
                  <button
                    v-if="!isAdmin"
                    class="icon-button"
                    type="button"
                    title="编辑"
                    @click="editReport(report)"
                  >
                    <el-icon><Edit /></el-icon>
                  </button>
                  <button
                    v-if="isAdmin || isTodayReport(report.submit_date)"
                    class="icon-button danger"
                    type="button"
                    title="删除"
                    @click="deleteReport(report)"
                  >
                    <el-icon><Delete /></el-icon>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="reports.length === 0">
              <td :colspan="isAdmin ? 5 : 4" class="empty-row">
                暂无日报数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="mobile-reports">
        <article v-for="report in reports" :key="report.id" class="mobile-report-card">
          <div class="mobile-report-top">
            <div>
              <strong>{{ buildReportTitle(report) }}</strong>
              <p>{{ formatDate(report.submit_date) }}</p>
            </div>
            <span class="status-chip" :class="getStatusClass(report)">
              {{ getStatusText(report) }}
            </span>
          </div>
          <div v-if="isAdmin" class="mobile-author">创建者：{{ report.user_name || '-' }}</div>
          <div class="mobile-preview">{{ buildPreview(report.content) }}</div>
          <div class="mobile-actions">
            <button class="icon-button" type="button" @click="viewReport(report)">
              <el-icon><View /></el-icon>
            </button>
            <button v-if="!isAdmin" class="icon-button" type="button" @click="editReport(report)">
              <el-icon><Edit /></el-icon>
            </button>
            <button
              v-if="isAdmin || isTodayReport(report.submit_date)"
              class="icon-button danger"
              type="button"
              @click="deleteReport(report)"
            >
              <el-icon><Delete /></el-icon>
            </button>
          </div>
        </article>
      </div>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>

    <el-dialog
      v-model="showCreateDialog"
      :title="editingReport ? '编辑日报' : '提交日报'"
      width="620px"
      destroy-on-close
      :lock-scroll="false"
      @closed="resetDialogState"
    >
      <el-form ref="formRef" :model="reportForm" :rules="rules" label-width="80px">
        <el-form-item label="日期" prop="submit_date">
          <el-date-picker v-model="reportForm.submit_date" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="reportForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入今天的学习总结、任务进展和心得体会..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="saveReport">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Delete, Edit, Plus, Search, View } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import api from '../api'
import { getDailyReportStatus } from '../utils/dailyReportStatus'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const reports = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dateRange = ref<string[]>([])
const showCreateDialog = ref(false)
const saving = ref(false)
const editingReport = ref<any>(null)
const formRef = ref<FormInstance>()
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)

const reportForm = reactive({
  submit_date: new Date(),
  content: '',
})

const rules: FormRules = {
  submit_date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  content: [
    { required: true, message: '请输入日报内容', trigger: 'blur' },
    { min: 10, message: '日报内容至少 10 个字符', trigger: 'blur' },
  ],
}

const isMobile = computed(() => windowWidth.value <= 768)
const isAdmin = computed(() => authStore.user?.role === 'admin')

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const loadReports = async () => {
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(pageSize.value),
    })

    if (searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }

    if (dateRange.value.length === 2) {
      params.append('start', dateRange.value[0])
      params.append('end', dateRange.value[1])
    }

    const response = await api.get(`/daily-reports?${params.toString()}`)
    reports.value = response.data.data || []
    total.value = response.data.total || 0
  } catch {
    ElMessage.error('加载日报失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadReports()
}

const openCreateDialog = () => {
  resetDialogState()
  showCreateDialog.value = true
}

const viewReport = (report: any) => {
  router.push(`/daily-reports/${report.id}`)
}

const editReport = (report: any) => {
  editingReport.value = report
  reportForm.submit_date = new Date(report.submit_date)
  reportForm.content = report.content
  showCreateDialog.value = true
}

const isTodayReport = (submitDate: string) => {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return submitDate === today
}

const getStatusMeta = (report: any) => {
  if (isAdmin.value) {
    return { text: '已提交', className: 'submitted' }
  }
  const status = getDailyReportStatus({
    hasSubmitted: true,
    unread_comments: report.unread_comments,
    is_reviewed: report.is_reviewed,
    reviewed_at: report.reviewed_at,
  })

  const classMap: Record<string, string> = {
    success: 'submitted',
    warning: 'pending',
    info: 'idle',
    danger: 'danger',
  }

  return {
    text: status.feedbackText,
    className: classMap[status.feedbackType] || 'idle',
  }
}

const getStatusText = (report: any) => getStatusMeta(report).text
const getStatusClass = (report: any) => getStatusMeta(report).className

const buildReportTitle = (report: any) => {
  const content = String(report.content || '').trim()
  if (!content) return '未命名日报'
  return content.length > 12 ? `${content.slice(0, 12)}...` : content
}

const buildPreview = (content: string) => {
  const text = String(content || '').replace(/\s+/g, ' ').trim()
  if (!text) return '暂无内容'
  return text.length > 36 ? `${text.slice(0, 36)}...` : text
}

const deleteReport = async (report: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条日报吗？此操作不可恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await api.delete(`/daily-reports/${report.id}`)
    ElMessage.success('删除成功')
    loadReports()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

const saveReport = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    saving.value = true
    try {
      const date = reportForm.submit_date
      const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      const reportData = {
        content: reportForm.content,
        submit_date: localDate,
      }

      if (editingReport.value) {
        await api.put(`/daily-reports/${editingReport.value.id}`, reportData)
        ElMessage.success('日报更新成功')
      } else {
        await api.post('/daily-reports', reportData)
        ElMessage.success('日报提交成功')
      }

      showCreateDialog.value = false
      resetDialogState()
      loadReports()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || '操作失败')
    } finally {
      saving.value = false
    }
  })
}

const handleDateChange = () => {
  currentPage.value = 1
  loadReports()
}

const resetDialogState = () => {
  editingReport.value = null
  reportForm.submit_date = new Date()
  reportForm.content = ''
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadReports()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadReports()
}

const syncWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  syncWindowWidth()
  window.addEventListener('resize', syncWindowWidth)
  loadReports()
})
</script>

<style scoped>
.daily-reports-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.daily-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.daily-heading h1 {
  margin: 0;
  color: #6461f3;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.daily-heading p {
  margin: 10px 0 0;
  color: #627089;
  font-size: 13px;
  line-height: 1.65;
}

.create-button {
  min-width: 160px;
  height: 48px;
  padding: 0 24px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #6662f1 0%, #a045f4 100%);
  box-shadow: 0 12px 24px rgba(112, 94, 246, 0.24);
  font-size: 14px;
  font-weight: 700;
}

.reports-shell {
  padding: 24px;
  border-radius: 32px;
  background: #ffffff;
  border: 1px solid #edf0f7;
  box-shadow: 0 14px 28px rgba(116, 122, 141, 0.08);
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 26px;
}

.search-field {
  flex: 1;
  min-width: 0;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border: 1px solid #e9edf6;
  border-radius: 20px;
  background: #f8f9fd;
  color: #8f97aa;
}

.search-field input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
  color: #364155;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ghost-button {
  height: 48px;
  padding: 0 18px;
  border-radius: 16px;
}

.reports-table-wrap {
  overflow: hidden;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table thead th {
  padding: 18px 0;
  text-align: left;
  color: #99a2b4;
  font-size: 14px;
  font-weight: 700;
  border-bottom: 1px solid #eef0f5;
}

.reports-table tbody td {
  padding: 24px 0;
  border-bottom: 1px solid #eef0f5;
  color: #556176;
  font-size: 16px;
}

.reports-table tbody tr:last-child td {
  border-bottom: none;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-cell strong {
  color: #20283a;
  font-size: 18px;
  font-weight: 800;
}

.title-cell span {
  color: #8d97aa;
  font-size: 13px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-chip.submitted {
  color: #0d9a62;
  background: #dff7ec;
}

.status-chip.pending {
  color: #d18300;
  background: #fff1c8;
}

.status-chip.idle {
  color: #7e8799;
  background: #f1f3f8;
}

.status-chip.danger {
  color: #e05c5c;
  background: #ffe4e4;
}

.action-buttons,
.mobile-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #9ba4b5;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, transform 180ms ease;
}

.icon-button:hover {
  background: #f3f5fb;
  color: #606b7d;
  transform: translateY(-1px);
}

.icon-button.danger:hover {
  color: #e05c5c;
  background: #fff0f0;
}

.empty-row {
  padding: 40px 0 !important;
  text-align: center;
  color: #97a1b4 !important;
}

.mobile-reports {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mobile-report-card {
  padding: 18px;
  border: 1px solid #edf0f7;
  border-radius: 24px;
  background: #fafbfe;
}

.mobile-report-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mobile-report-top strong {
  color: #20283a;
  font-size: 17px;
}

.mobile-report-top p,
.mobile-author,
.mobile-preview {
  color: #7c879a;
}

.mobile-report-top p {
  margin: 8px 0 0;
  font-size: 13px;
}

.mobile-author {
  margin-top: 12px;
  font-size: 13px;
}

.mobile-preview {
  margin-top: 12px;
  line-height: 1.7;
  font-size: 14px;
}

.mobile-actions {
  margin-top: 14px;
}

.pagination-row {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-date-editor.el-input__wrapper),
:deep(.el-segmented) {
  border-radius: 16px;
}

:deep(.el-dialog) {
  border-radius: 28px;
}

@media (max-width: 1100px) {
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: stretch;
  }

  .toolbar-actions :deep(.el-date-editor) {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .daily-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .daily-heading h1 {
    font-size: 20px;
  }

  .daily-heading p {
    font-size: 12px;
  }

  .reports-shell {
    padding: 18px;
  }

  .toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-row {
    justify-content: center;
  }
}
</style>

<template>
  <div class="assignments-page">
    <section class="module-heading">
      <div>
        <h1>作业中心</h1>
        <p>查看作业要求、提交状态和批改进度，所有作业流程统一收在同一块工作区内。</p>
      </div>
      <el-button v-if="isAdmin" type="primary" class="module-action" @click="handleCreate">新建作业</el-button>
    </section>

    <section class="module-shell">
      <div class="toolbar-row">
        <div class="search-field">
          <el-icon><Search /></el-icon>
          <input v-model="searchQuery" type="text" placeholder="搜索作业..." @keyup.enter="handleSearch" />
        </div>
        <el-button class="ghost-button" @click="handleSearch">搜索</el-button>
      </div>

      <div v-if="assignments.length === 0 && !loading" class="empty-state">暂无作业数据</div>

      <div v-else-if="!isMobile" class="table-wrap">
        <table class="module-table">
          <thead>
            <tr>
              <th>作业标题</th>
              <th>描述</th>
              <th>截止日期</th>
              <th>状态</th>
              <th>创建者</th>
              <th v-if="isAdmin">提交情况</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="assignment in assignments" :key="assignment.id">
              <td><strong>{{ assignment.title }}</strong></td>
              <td class="desc-cell">{{ assignment.description || '暂无描述' }}</td>
              <td>{{ formatDate(assignment.deadline) }}</td>
              <td>
                <span class="status-chip" :class="getAssignmentStatusType(assignment.deadline)">
                  {{ getAssignmentStatusText(assignment.deadline) }}
                </span>
              </td>
              <td>{{ assignment.created_by_name || '-' }}</td>
              <td v-if="isAdmin">
                <span class="status-chip progress">
                  {{ assignment.submission_count || 0 }} / {{ assignment.total_students || 0 }}
                </span>
              </td>
              <td>
                <div class="action-links">
                  <button type="button" class="table-link" @click="viewAssignment(assignment)">查看</button>
                  <button v-if="isAdmin" type="button" class="table-link" @click="viewSubmissions(assignment)">提交</button>
                  <button v-if="isAdmin" type="button" class="table-link" @click="editAssignment(assignment)">编辑</button>
                  <button v-if="isAdmin" type="button" class="table-link danger" @click="deleteAssignment(assignment)">删除</button>
                  <button v-else type="button" class="table-link" @click="viewAssignment(assignment)">去提交</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="mobile-list">
        <article v-for="assignment in assignments" :key="assignment.id" class="mobile-card">
          <div class="mobile-card-top">
            <strong>{{ assignment.title }}</strong>
            <span class="status-chip" :class="getAssignmentStatusType(assignment.deadline)">
              {{ getAssignmentStatusText(assignment.deadline) }}
            </span>
          </div>
          <p class="mobile-desc">{{ assignment.description || '暂无描述' }}</p>
          <div class="mobile-meta">
            <span>{{ formatDate(assignment.deadline) }}</span>
            <span v-if="isAdmin">{{ assignment.submission_count || 0 }}/{{ assignment.total_students || 0 }}</span>
          </div>
          <div class="mobile-actions">
            <button type="button" class="table-link" @click="viewAssignment(assignment)">查看</button>
            <button v-if="isAdmin" type="button" class="table-link" @click="viewSubmissions(assignment)">提交</button>
            <button v-if="isAdmin" type="button" class="table-link" @click="editAssignment(assignment)">编辑</button>
            <button v-if="isAdmin" type="button" class="table-link danger" @click="deleteAssignment(assignment)">删除</button>
            <button v-else type="button" class="table-link" @click="viewAssignment(assignment)">去提交</button>
          </div>
        </article>
      </div>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Search } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import api from '../api'
import { normalizeListPayload } from '../utils/apiResponse'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')
const isAdminRoute = computed(() => route.path.startsWith('/admin/'))
const isMobile = computed(() => window.innerWidth <= 768)

const searchQuery = ref('')
const assignments = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const getAssignmentStatusType = (deadline: string) => {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  if (deadlineDate < now) return 'danger'
  return 'success'
}

const getAssignmentStatusText = (deadline: string) => {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  if (deadlineDate < now) return '已截止'
  return '进行中'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
  loadAssignments()
}

const loadAssignments = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(pageSize.value),
    })
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    const response = await api.get(`/assignments?${params}`)
    const payload = normalizeListPayload(response.data)
    assignments.value = payload.data
    total.value = payload.total
  } catch (error) {
    console.error('Error loading assignments:', error)
    ElMessage.error('加载作业列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadAssignments()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadAssignments()
}

const handleCreate = () => {
  router.push(isAdminRoute.value ? '/admin/assignments/create' : '/assignments/create')
}

const viewAssignment = (assignment: any) => {
  router.push(isAdminRoute.value ? `/admin/assignments/${assignment.id}` : `/assignments/${assignment.id}`)
}

const viewSubmissions = (assignment: any) => {
  router.push(isAdminRoute.value ? `/admin/assignments/${assignment.id}` : `/assignments/${assignment.id}`)
  setTimeout(() => {
    document.querySelector('.submissions-card')?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

const editAssignment = (assignment: any) => {
  router.push(isAdminRoute.value ? `/admin/assignments/${assignment.id}/edit` : `/assignments/${assignment.id}/edit`)
}

const deleteAssignment = async (assignment: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除作业“${assignment.title}”吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    await api.delete(`/assignments/${assignment.id}`)
    ElMessage.success('删除成功')
    loadAssignments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

onMounted(() => {
  loadAssignments()
})
</script>

<style scoped>
.assignments-page {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.module-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.module-heading h1 {
  margin: 0;
  color: #6461f3;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.module-heading p {
  margin: 10px 0 0;
  color: #627089;
  font-size: 13px;
  line-height: 1.65;
}

.module-action {
  min-width: 136px;
  height: 48px;
  border-radius: 18px;
  background: linear-gradient(135deg, #6662f1 0%, #a045f4 100%);
  border: none;
  box-shadow: 0 12px 24px rgba(112, 94, 246, 0.24);
}

.module-shell {
  padding: 22px;
  border-radius: 30px;
  background: #fff;
  border: 1px solid #edf0f7;
  box-shadow: 0 14px 28px rgba(116, 122, 141, 0.08);
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}

.search-field {
  flex: 1;
  min-width: 0;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border: 1px solid #e9edf6;
  border-radius: 18px;
  background: #f8f9fd;
  color: #8f97aa;
}

.search-field input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 14px;
  color: #364155;
}

.ghost-button {
  height: 46px;
  border-radius: 16px;
}

.empty-state {
  padding: 48px 0;
  text-align: center;
  color: #97a1b4;
  font-size: 14px;
}

.module-table {
  width: 100%;
  border-collapse: collapse;
}

.module-table thead th {
  padding: 16px 0;
  text-align: left;
  color: #99a2b4;
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid #eef0f5;
}

.module-table tbody td {
  padding: 22px 0;
  color: #556176;
  font-size: 15px;
  border-bottom: 1px solid #eef0f5;
}

.module-table tbody tr:last-child td {
  border-bottom: none;
}

.module-table strong {
  color: #20283a;
  font-size: 16px;
}

.desc-cell {
  max-width: 280px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 66px;
  padding: 5px 14px;
  border-radius: 999px;
  background: #f1f3f8;
  color: #7e8799;
  font-size: 12px;
  font-weight: 700;
}

.status-chip.success {
  background: #dff7ec;
  color: #0d9a62;
}

.status-chip.danger {
  background: #ffe4e4;
  color: #e05c5c;
}

.status-chip.progress {
  background: #eef2ff;
  color: #5a67d8;
}

.action-links,
.mobile-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.table-link {
  border: none;
  background: transparent;
  color: #61708c;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.table-link.danger {
  color: #e05c5c;
}

.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-card {
  padding: 18px;
  border-radius: 22px;
  background: #fafbfe;
  border: 1px solid #edf0f7;
}

.mobile-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mobile-card-top strong {
  color: #20283a;
  font-size: 16px;
}

.mobile-desc {
  margin: 10px 0 0;
  color: #7c879a;
  font-size: 14px;
  line-height: 1.65;
}

.mobile-meta {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #8d97aa;
  font-size: 12px;
}

.mobile-actions {
  margin-top: 14px;
}

.pagination-row {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .module-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .module-heading h1 {
    font-size: 20px;
  }

  .module-heading p {
    font-size: 12px;
  }

  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-row {
    justify-content: center;
  }
}
</style>

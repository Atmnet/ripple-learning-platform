<template>
  <div class="user-management-page">
    <section class="module-heading">
      <div>
        <h1>学员管理</h1>
        <p>统一管理账号、角色和密码，列表按需加载，避免后台打开时一次拉取全部数据。</p>
      </div>
      <el-button type="primary" class="module-action" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新增学员
      </el-button>
    </section>

    <section class="module-shell">
      <div class="toolbar-row">
        <div class="search-field">
          <el-icon><Search /></el-icon>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索账号或姓名..."
            @keyup.enter="handleSearch"
          />
        </div>
        <el-button class="ghost-button" @click="handleSearch">搜索</el-button>
      </div>

      <div v-if="users.length === 0 && !loading" class="empty-state">暂无学员数据</div>

      <div v-else-if="!isMobile" class="table-wrap">
        <table class="module-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>账号</th>
              <th>姓名</th>
              <th>角色</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td><strong>{{ user.username }}</strong></td>
              <td>{{ user.real_name }}</td>
              <td>
                <span class="status-chip" :class="user.role === 'admin' ? 'warning' : 'success'">
                  {{ user.role === 'admin' ? '管理员' : '学员' }}
                </span>
              </td>
              <td>{{ formatDateTime(user.created_at) }}</td>
              <td>
                <div class="action-links">
                  <button type="button" class="table-link" @click="handleResetPassword(user)">重置密码</button>
                  <button type="button" class="table-link" @click="handleEdit(user)">编辑</button>
                  <button type="button" class="table-link danger" @click="handleDelete(user)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="mobile-list">
        <article v-for="user in users" :key="user.id" class="mobile-card">
          <div class="mobile-card-top">
            <strong>{{ user.real_name }}</strong>
            <span class="status-chip" :class="user.role === 'admin' ? 'warning' : 'success'">
              {{ user.role === 'admin' ? '管理员' : '学员' }}
            </span>
          </div>
          <p class="mobile-meta">@{{ user.username }}</p>
          <p class="mobile-meta">{{ formatDateTime(user.created_at) }}</p>
          <div class="mobile-actions">
            <button type="button" class="table-link" @click="handleResetPassword(user)">重置密码</button>
            <button type="button" class="table-link" @click="handleEdit(user)">编辑</button>
            <button type="button" class="table-link danger" @click="handleDelete(user)">删除</button>
          </div>
        </article>
      </div>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>

    <el-dialog
      v-model="showCreateDialog"
      title="新增学员"
      width="520px"
      destroy-on-close
      :lock-scroll="false"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="86px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="real_name">
          <el-input v-model="createForm.real_name" placeholder="请输入学员姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            placeholder="请输入至少 6 位密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="createForm.role">
            <el-radio label="student">学员</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" :loading="creating" @click="handleCreate">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showEditDialog"
      title="编辑学员"
      width="520px"
      destroy-on-close
      :lock-scroll="false"
    >
      <el-form :model="editForm" label-width="86px">
        <el-form-item label="账号">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="editForm.real_name" placeholder="请输入学员姓名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="editForm.role">
            <el-radio label="student">学员</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" :loading="updating" @click="handleUpdate">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showResetDialog"
      title="重置密码"
      width="520px"
      destroy-on-close
      :lock-scroll="false"
    >
      <div class="reset-tip">
        正在为 <strong>{{ currentUser?.real_name }}</strong> 重置密码
      </div>
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="86px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入至少 6 位密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showResetDialog = false">取消</el-button>
          <el-button type="primary" :loading="resetting" @click="confirmResetPassword">确认重置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import api from '../api'
import { normalizeListPayload } from '../utils/apiResponse'

const loading = ref(false)
const users = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)

const isMobile = computed(() => windowWidth.value <= 768)

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showResetDialog = ref(false)
const creating = ref(false)
const updating = ref(false)
const resetting = ref(false)

const createFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()
const currentUser = ref<any>(null)

const createForm = ref({
  username: '',
  real_name: '',
  password: '',
  role: 'student',
})

const editForm = ref({
  id: 0,
  username: '',
  real_name: '',
  role: 'student',
})

const resetForm = ref({
  newPassword: '',
})

const createRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  real_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' },
  ],
}

const resetRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' },
  ],
}

const formatDateTime = (value: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

const loadUsers = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(pageSize.value),
    })
    if (searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }
    const response = await api.get(`/users?${params.toString()}`)
    const payload = normalizeListPayload(response.data)
    users.value = payload.data
    total.value = payload.total
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '加载学员列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleSizeChange = (value: number) => {
  pageSize.value = value
  loadUsers()
}

const handleCurrentChange = (value: number) => {
  currentPage.value = value
  loadUsers()
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    creating.value = true
    try {
      await api.post('/users', createForm.value)
      ElMessage.success('学员创建成功')
      showCreateDialog.value = false
      createForm.value = { username: '', real_name: '', password: '', role: 'student' }
      loadUsers()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || '创建失败')
    } finally {
      creating.value = false
    }
  })
}

const handleEdit = (user: any) => {
  editForm.value = { ...user }
  showEditDialog.value = true
}

const handleUpdate = async () => {
  updating.value = true
  try {
    await api.put(`/users/${editForm.value.id}`, {
      real_name: editForm.value.real_name,
      role: editForm.value.role,
    })
    ElMessage.success('更新成功')
    showEditDialog.value = false
    loadUsers()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '更新失败')
  } finally {
    updating.value = false
  }
}

const handleResetPassword = (user: any) => {
  currentUser.value = user
  resetForm.value.newPassword = ''
  showResetDialog.value = true
}

const confirmResetPassword = async () => {
  if (!resetFormRef.value) return
  await resetFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    resetting.value = true
    try {
      await api.post(`/users/${currentUser.value.id}/reset-password`, {
        newPassword: resetForm.value.newPassword,
      })
      ElMessage.success('密码重置成功')
      showResetDialog.value = false
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || '重置失败')
    } finally {
      resetting.value = false
    }
  })
}

const handleDelete = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除“${user.real_name}”吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await api.delete(`/users/${user.id}`)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

onMounted(() => {
  loadUsers()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      windowWidth.value = window.innerWidth
    })
  }
})
</script>

<style scoped>
.user-management-page {
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
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.module-heading p {
  margin: 10px 0 0;
  color: #6e778a;
  font-size: 14px;
  line-height: 1.6;
}

.module-action {
  min-width: 132px;
  height: 46px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #6764f6 0%, #a64ef4 100%);
  box-shadow: 0 18px 32px rgba(101, 97, 243, 0.22);
}

.module-shell {
  padding: 24px;
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 52px rgba(18, 25, 38, 0.08);
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.search-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 0 18px;
  border-radius: 24px;
  background: #f7f8fc;
  border: 1px solid #eceef8;
  color: #98a1b3;
}

.search-field input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #24304a;
}

.ghost-button {
  min-width: 92px;
  height: 46px;
  border-radius: 18px;
}

.table-wrap {
  overflow: hidden;
  border-radius: 28px;
  background: #fff;
  border: 1px solid #eff1f7;
}

.module-table {
  width: 100%;
  border-collapse: collapse;
}

.module-table th,
.module-table td {
  padding: 22px 20px;
  text-align: left;
  border-bottom: 1px solid #edf0f7;
}

.module-table th {
  color: #8f97ab;
  font-size: 13px;
  font-weight: 700;
}

.module-table td {
  color: #24304a;
  font-size: 15px;
}

.module-table tbody tr:last-child td {
  border-bottom: none;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-chip.success {
  background: #dcfce7;
  color: #15803d;
}

.status-chip.warning {
  background: #fef3c7;
  color: #b45309;
}

.action-links {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.table-link {
  border: none;
  background: transparent;
  color: #5f6cff;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.table-link.danger {
  color: #f15c6d;
}

.mobile-list {
  display: grid;
  gap: 14px;
}

.mobile-card {
  padding: 18px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #eff1f7;
}

.mobile-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mobile-meta {
  margin: 10px 0 0;
  color: #7d8699;
  font-size: 13px;
}

.mobile-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 220px;
  border-radius: 28px;
  background: #fff;
  color: #8a93a8;
  border: 1px dashed #e3e7f2;
}

.reset-tip {
  margin-bottom: 16px;
  color: #6e778a;
}

@media (max-width: 960px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
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

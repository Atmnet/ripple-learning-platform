<template>
  <div class="gradebook">
    <section class="module-heading">
      <div>
        <h1>成绩中心</h1>
        <p>统一查看作业成绩、批改状态和反馈信息，并支持成绩导入导出。</p>
      </div>
      <div class="heading-actions">
        <el-button type="primary" @click="exportGrades">导出成绩</el-button>
        <el-upload
          class="upload-inline"
          action="/api/grades/import"
          :headers="uploadHeaders"
          :show-file-list="false"
          :before-upload="beforeImport"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
          accept=".csv"
        >
          <el-button type="success">导入成绩</el-button>
        </el-upload>
      </div>
    </section>

    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="search-header">
          <el-input
            v-model="searchQuery"
            placeholder="搜索学员姓名或作业名称"
            clearable
            class="search-input"
            @clear="loadGrades"
            @keyup.enter="loadGrades"
          />
          <el-select v-model="filterStatus" placeholder="批改状态" clearable class="status-select" @change="loadGrades">
            <el-option label="全部" value="" />
            <el-option label="已批改" value="graded" />
            <el-option label="未批改" value="ungraded" />
          </el-select>
          <el-button type="primary" @click="loadGrades">查询</el-button>
        </div>
      </template>

      <el-table :data="filteredGrades" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="student_name" label="学员姓名" width="120" />
        <el-table-column prop="assignment_title" label="作业" min-width="220" />
        <el-table-column prop="grade" label="成绩" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.grade !== null && row.grade !== undefined" :type="getGradeType(row.grade)">
              {{ row.grade }} 分
            </el-tag>
            <el-tag v-else type="info">未批改</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="feedback" label="反馈" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.feedback || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="submitted_at" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.submitted_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.grade !== null && row.grade !== undefined ? 'success' : 'warning'">
              {{ row.grade !== null && row.grade !== undefined ? '已批改' : '未批改' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="editGrade(row)">批改</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
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
    </el-card>

    <el-dialog v-model="editDialogVisible" title="批改作业" width="500px" destroy-on-close :lock-scroll="false">
      <el-form :model="gradeForm" label-width="100px">
        <el-form-item label="学员姓名">
          <el-input v-model="gradeForm.student_name" disabled />
        </el-form-item>
        <el-form-item label="作业">
          <el-input v-model="gradeForm.assignment_title" disabled />
        </el-form-item>
        <el-form-item label="成绩">
          <el-input-number v-model="gradeForm.grade" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="反馈">
          <el-input v-model="gradeForm.feedback" type="textarea" :rows="3" placeholder="请输入评语或反馈" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveGrade">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)

const searchQuery = ref('')
const filterStatus = ref('')
const grades = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const editDialogVisible = ref(false)
const gradeForm = ref({
  id: 0,
  student_name: '',
  assignment_title: '',
  grade: 0,
  feedback: '',
})

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}))

const filteredGrades = computed(() => {
  let result = grades.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (g: any) =>
        g.student_name?.toLowerCase().includes(query) ||
        g.assignment_title?.toLowerCase().includes(query),
    )
  }

  if (filterStatus.value) {
    result = result.filter((g: any) =>
      filterStatus.value === 'graded' ? g.grade !== null : g.grade === null,
    )
  }

  total.value = result.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

const getGradeType = (grade: number) => {
  if (grade >= 90) return 'success'
  if (grade >= 80) return 'primary'
  if (grade >= 70) return 'warning'
  if (grade >= 60) return 'info'
  return 'danger'
}

const formatDate = (dateString: string) => (!dateString ? '-' : new Date(dateString).toLocaleString('zh-CN'))

const loadGrades = async () => {
  loading.value = true
  try {
    const response = await api.get('/grades')
    grades.value = response.data
    total.value = response.data.length
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '加载成绩失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const exportGrades = async () => {
  try {
    const response = await api.get('/grades/export', {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `grades_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    ElMessage.success('成绩导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const beforeImport = (file: File) => {
  const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv')
  if (!isCSV) {
    ElMessage.error('请上传 CSV 格式文件')
    return false
  }
  return true
}

const handleImportSuccess = (response: any) => {
  ElMessage.success(response.message || '导入成功')
  loadGrades()
}

const handleImportError = (error: any) => {
  ElMessage.error(`导入失败：${error.response?.data?.error || '未知错误'}`)
}

const editGrade = (grade: any) => {
  gradeForm.value = {
    id: grade.id,
    student_name: grade.student_name,
    assignment_title: grade.assignment_title,
    grade: grade.grade || 0,
    feedback: grade.feedback || '',
  }
  editDialogVisible.value = true
}

const saveGrade = async () => {
  saving.value = true
  try {
    await api.post('/grades/import', {
      grades: [
        {
          submission_id: gradeForm.value.id,
          grade: gradeForm.value.grade,
          feedback: gradeForm.value.feedback,
        },
      ],
    })
    ElMessage.success('成绩保存成功')
    editDialogVisible.value = false
    loadGrades()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadGrades()
})
</script>

<style scoped>
.gradebook {
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
  align-items: center;
}

.list-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.search-header {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 320px;
}

.status-select {
  width: 160px;
}

.upload-inline {
  display: inline-block;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 900px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .heading-actions,
  .search-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .status-select {
    width: 100%;
  }
}
</style>

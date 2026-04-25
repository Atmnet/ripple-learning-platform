<template>
  <div class="assignment-detail">
    <section class="module-heading">
      <div>
        <h1>作业详情</h1>
        <p>查看作业说明、附件、提交状态与批改反馈，学员和管理员在同一块工作区内完成主要操作。</p>
      </div>
      <div class="heading-actions">
        <el-button v-if="authStore.user?.role === 'admin'" type="primary" @click="handleEdit">编辑作业</el-button>
        <el-button v-if="authStore.user?.role === 'admin'" type="success" @click="viewSubmissions">查看提交</el-button>
      </div>
    </section>

    <el-card class="assignment-card" v-loading="loading" shadow="never">
      <template #header>
        <div class="card-header">
          <h2>{{ assignment.title }}</h2>
          <el-tag :type="getAssignmentStatusType(assignment.deadline)">
            {{ getAssignmentStatusText(assignment.deadline) }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="创建者">{{ assignment.created_by_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatDate(assignment.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="截止时间">{{ formatDate(assignment.deadline) }}</el-descriptions-item>
        <el-descriptions-item v-if="authStore.user?.role === 'admin'" label="提交情况">
          <el-tag type="success">{{ submittedCount }} 人已提交</el-tag>
          <el-tag type="danger" style="margin-left: 8px;">{{ unsubmittedCount }} 人未提交</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-else label="我的提交状态">
          <el-tag :type="mySubmission ? 'success' : 'info'">{{ mySubmission ? '已提交' : '未提交' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="content-block">
        <div class="content-title">作业描述</div>
        <div class="content-box">
          <el-text type="info">{{ assignment.description || '暂无描述' }}</el-text>
        </div>
      </div>

      <div v-if="assignment.file_url || attachmentList.length > 0" class="content-block">
        <div class="content-title">作业附件</div>
        <div class="attachments" v-if="attachmentList.length > 0">
          <div v-for="(file, index) in attachmentList" :key="index" class="attachment-item">
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ getFileName(file) }}</span>
            <el-button link type="primary" @click="openFile(file)">下载</el-button>
          </div>
        </div>
        <div class="attachments" v-else-if="assignment.file_url">
          <div class="attachment-item">
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ getFileName(assignment.file_url) }}</span>
            <el-button link type="primary" @click="openFile(assignment.file_url)">下载</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="submissions-card" v-if="authStore.user?.role === 'admin'" shadow="never">
      <template #header>
        <div class="card-header">
          <span>已提交学员（{{ submittedList.length }} 人）</span>
          <el-button type="primary" @click="refreshSubmissions">刷新</el-button>
        </div>
      </template>

      <el-table :data="submittedList" style="width: 100%" v-loading="loadingSubmissions">
        <el-table-column prop="student_name" label="学员姓名" />
        <el-table-column prop="student_username" label="账号" />
        <el-table-column prop="submitted_at" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.submitted_at) }}
          </template>
        </el-table-column>
        <el-table-column label="附件" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.file_urls && row.file_urls.length > 0" type="success">{{ row.file_count || row.file_urls.length }} 个</el-tag>
            <el-tag v-else-if="row.file_url?.trim()" type="success">有</el-tag>
            <el-tag v-else type="info">无</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="得分" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.grade !== null && row.grade !== undefined" type="success">{{ row.grade }} 分</el-tag>
            <el-tag v-else type="info">未批改</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewSubmission(row)">查看</el-button>
            <el-button type="success" link @click="downloadSubmission(row)">下载作业</el-button>
            <el-button
              v-if="row.grade === null || row.grade === undefined"
              type="danger"
              link
              @click="gradeSubmission(row)"
            >
              批改
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="submittedList.length === 0" description="暂无人提交" />
    </el-card>

    <el-card class="submissions-card" v-if="authStore.user?.role === 'admin'" shadow="never">
      <template #header>
        <div class="card-header">
          <span>未提交学员（{{ unsubmittedList.length }} 人）</span>
        </div>
      </template>

      <el-table :data="unsubmittedList" style="width: 100%">
        <el-table-column prop="real_name" label="学员姓名" />
        <el-table-column prop="username" label="账号" />
        <el-table-column label="状态" width="100">
          <template #default>
            <el-tag type="danger">未提交</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="unsubmittedList.length === 0" description="所有人都已提交" />
    </el-card>

    <el-card class="submit-card" v-if="authStore.user?.role === 'student' && mySubmission" shadow="never">
      <template #header>
        <div class="card-header">
          <span>我的提交</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="提交时间">{{ formatDateTime(mySubmission.submitted_at) }}</el-descriptions-item>
        <el-descriptions-item label="成绩">
          <el-tag v-if="mySubmission.grade !== null && mySubmission.grade !== undefined" type="success">{{ mySubmission.grade }} 分</el-tag>
          <el-tag v-else type="info">待批改</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="反馈" :span="2">{{ mySubmission.feedback || '暂无反馈' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ mySubmission.comment || '无' }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="mySubmissionFileUrls.length > 0" class="attachments submission-files">
        <div v-for="file in mySubmissionFileUrls" :key="file" class="attachment-item">
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ getFileName(file) }}</span>
          <el-button link type="primary" @click="openFile(file)">下载</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="submit-card" v-if="authStore.user?.role === 'student' && !mySubmission" shadow="never">
      <template #header>
        <div class="card-header">
          <span>提交作业</span>
        </div>
      </template>

      <el-alert
        v-if="isExpired"
        title="作业已截止"
        type="error"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      />

      <el-form :model="submitForm" label-width="80px">
        <el-form-item label="上传文件" required>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="ASSIGNMENT_MAX_FILE_COUNT"
            :on-exceed="handleExceed"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            action="#"
            multiple
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Word、PPT、Excel、图片、压缩包等格式，单个文件不超过 50MB，最多上传 5 个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="submitForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入提交备注（可选）"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="submitting"
            :disabled="isExpired || fileList.length === 0 || submitting"
            @click="handleSubmit"
          >
            {{ submitting ? `上传中 ${uploadProgress}%` : '提交作业' }}
          </el-button>
        </el-form-item>

        <el-form-item v-if="submitting">
          <el-progress
            :percentage="uploadProgress"
            :status="uploadProgress === 100 ? 'success' : ''"
            :stroke-width="20"
            striped
          />
          <div v-if="currentUploadFile" class="upload-file-name">
            正在上传：{{ currentUploadFile }}
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="gradeDialogVisible" title="批改作业" width="500px" destroy-on-close :lock-scroll="false">
      <el-form :model="gradeForm" label-width="80px">
        <el-form-item label="学员">
          <span>{{ currentSubmission?.student_name }}</span>
        </el-form-item>
        <el-form-item label="成绩" prop="grade">
          <el-input-number v-model="gradeForm.grade" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="反馈">
          <el-input
            v-model="gradeForm.feedback"
            type="textarea"
            :rows="3"
            placeholder="请输入评语或反馈"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="grading" @click="submitGrade">确认批改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, UploadFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import api from '../api'
import {
  ASSIGNMENT_ALLOWED_FILE_TYPES,
  ASSIGNMENT_MAX_FILE_COUNT,
  ASSIGNMENT_MAX_FILE_SIZE_MB,
} from '../constants/fileUpload'
import { normalizeListPayload } from '../utils/apiResponse'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isAdminRoute = computed(() => route.path.startsWith('/admin/'))
const assignmentListPath = computed(() => (isAdminRoute.value ? '/admin/assignments' : '/assignments'))
const loading = ref(false)
const loadingSubmissions = ref(false)

const assignment = ref({
  id: '',
  title: '',
  description: '',
  deadline: '',
  file_url: '',
  created_by_name: '',
  created_at: '',
})

const submittedList = ref<any[]>([])
const unsubmittedList = ref<any[]>([])
const submittedCount = computed(() => submittedList.value.length)
const unsubmittedCount = computed(() => unsubmittedList.value.length)
const mySubmission = ref<any>(null)

const attachmentList = computed(() => {
  const fileUrl = assignment.value.file_url
  if (!fileUrl) return []
  try {
    const parsed = JSON.parse(fileUrl)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // ignore
  }
  return fileUrl ? [fileUrl] : []
})

const mySubmissionFileUrls = computed(() => normalizeFileUrls(mySubmission.value?.file_url))

const gradeDialogVisible = ref(false)
const grading = ref(false)
const currentSubmission = ref<any>(null)
const gradeForm = ref({
  grade: 0,
  feedback: '',
})

const uploadRef = ref()
const fileList = ref<any[]>([])
const submitForm = ref({
  comment: '',
})
const submitting = ref(false)
const uploadProgress = ref(0)
const currentUploadFile = ref('')

const isExpired = computed(() => new Date(assignment.value.deadline) < new Date())

const getAssignmentStatusType = (deadline: string) => (new Date(deadline) < new Date() ? 'danger' : 'success')
const getAssignmentStatusText = (deadline: string) => (new Date(deadline) < new Date() ? '已截止' : '进行中')
const formatDate = (dateString: string) => (!dateString ? '-' : new Date(dateString).toLocaleDateString('zh-CN'))
const formatDateTime = (dateString: string) => (!dateString ? '-' : new Date(dateString).toLocaleString('zh-CN'))

const handleEdit = () => {
  router.push(isAdminRoute.value ? `/admin/assignments/${assignment.value.id}/edit` : `/assignments/${assignment.value.id}/edit`)
}

const viewSubmissions = () => {
  document.querySelector('.submissions-card')?.scrollIntoView({ behavior: 'smooth' })
}

const refreshSubmissions = () => {
  loadAllSubmissions()
}

const viewSubmission = (submission: any) => {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const content = `
    <div style="text-align:left;">
      <p><strong>学员：</strong>${escapeHtml(submission.student_name || '未知')}</p>
      <p><strong>账号：</strong>${escapeHtml(submission.student_username || '-')}</p>
      <p><strong>提交时间：</strong>${formatDateTime(submission.submitted_at)}</p>
      <p><strong>成绩：</strong>${submission.grade !== null ? `${submission.grade} 分` : '未批改'}</p>
      ${submission.feedback ? `<p><strong>反馈：</strong>${escapeHtml(submission.feedback)}</p>` : ''}
      ${submission.comment ? `<p><strong>备注：</strong>${escapeHtml(submission.comment)}</p>` : ''}
    </div>
  `

  ElMessageBox.alert(content, '提交详情', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭',
  })
}

const gradeSubmission = (submission: any) => {
  currentSubmission.value = submission
  gradeForm.value.grade = submission.grade || 60
  gradeForm.value.feedback = submission.feedback || ''
  gradeDialogVisible.value = true
}

const submitGrade = async () => {
  if (!currentSubmission.value) return
  grading.value = true
  try {
    await api.post(`/assignments/${route.params.id}/grade`, {
      submissionId: currentSubmission.value.id,
      grade: gradeForm.value.grade,
      feedback: gradeForm.value.feedback,
    })
    ElMessage.success('批改成功')
    gradeDialogVisible.value = false
    loadAllSubmissions()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '批改失败')
  } finally {
    grading.value = false
  }
}

const openFile = (url: string) => {
  window.open(url, '_blank')
}

const normalizeFileUrls = (value: string | null | undefined) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return [value]
  }
}

const getSubmissionPrimaryFile = (submission: any) => {
  const files = submission.file_urls?.length ? submission.file_urls : normalizeFileUrls(submission.file_url)
  return files[0] || ''
}

const getFileName = (url: string): string => {
  if (!url || typeof url !== 'string') return '未知文件'
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const encodedFileName = pathname.split('/').pop() || ''
    const fileName = decodeURIComponent(encodedFileName)
    const match = fileName.match(/^(\d+)-(\d+)\.(.+)$/)
    if (match && match[3]) return `作业文件.${match[3]}`
    return fileName || '未知文件'
  } catch {
    try {
      return decodeURIComponent(url.split('/').pop() || '') || '未知文件'
    } catch {
      return '未知文件'
    }
  }
}

const triggerDownload = (data: BlobPart, fileName: string) => {
  const blob = new Blob([data])
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(blobUrl)
}

const downloadSubmissionFile = async (submission: any, fileIndex = 0) => {
  const submissionId = submission.id
  const fileUrl = submission.file_urls?.[fileIndex] || getSubmissionPrimaryFile(submission)

  if (!submissionId || !fileUrl) {
    ElMessage.error('提交文件不存在，无法下载')
    return
  }

  const response = await api.get(`/submissions/${submissionId}/download`, {
    params: { index: fileIndex },
    responseType: 'blob',
  })

  const contentDisposition = response.headers['content-disposition']
  let fileName = `${submission.student_name || submission.real_name || '未知'}_作业`

  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
    if (utf8Match) fileName = decodeURIComponent(utf8Match[1])
    else {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
      if (filenameMatch) fileName = filenameMatch[1]
    }
  } else {
    const ext = fileUrl.split('.').pop()?.toLowerCase() || ''
    if (ext) fileName = `${fileName}.${ext}`
  }

  triggerDownload(response.data, fileName)
  ElMessage.success(`正在下载 ${fileName}`)
}

const downloadSubmission = async (submission: any) => {
  if (submission.file_urls && submission.file_urls.length > 1) {
    ElMessage.info(`开始下载 ${submission.file_urls.length} 个文件，请允许浏览器下载多个文件`)
    for (let i = 0; i < submission.file_urls.length; i += 1) {
      await downloadSubmissionFile(submission, i)
      if (i < submission.file_urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
    ElMessage.success('所有文件下载完成')
    return
  }

  const fileUrl = getSubmissionPrimaryFile(submission)
  const submissionId = submission.id
  if (!fileUrl) {
    ElMessage.warning('该学员未上传文件或文件地址为空')
    return
  }
  if (!submissionId) {
    ElMessage.error('提交 ID 为空，无法下载')
    return
  }

  try {
    const response = await api.get(`/submissions/${submissionId}/download`, {
      responseType: 'blob',
    })
    const contentDisposition = response.headers['content-disposition']
    let fileName = `${submission.student_name || submission.real_name || '未知'}_作业`

    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
      if (utf8Match) fileName = decodeURIComponent(utf8Match[1])
      else {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
        if (filenameMatch) fileName = filenameMatch[1]
      }
    } else {
      const ext = fileUrl.split('.').pop()?.toLowerCase() || ''
      if (ext) fileName = `${fileName}.${ext}`
    }

    triggerDownload(response.data, fileName)
    ElMessage.success(`正在下载 ${fileName}`)
  } catch (error: any) {
    console.error('Download error:', error)
    if (error.response?.status === 404) ElMessage.error('文件不存在')
    else ElMessage.error('下载失败，请重试')
  }
}

const beforeUpload = (file: File) => {
  const isAllowed = ASSIGNMENT_ALLOWED_FILE_TYPES.includes(file.type as never) || file.type === ''
  if (!isAllowed) {
    ElMessage.error('不支持的文件类型，请上传文档、图片或压缩包')
    return false
  }

  const isLt50M = file.size / 1024 / 1024 < ASSIGNMENT_MAX_FILE_SIZE_MB
  if (!isLt50M) {
    ElMessage.error(`文件大小不能超过 ${ASSIGNMENT_MAX_FILE_SIZE_MB}MB`)
    return false
  }
  return true
}

const handleFileChange = (file: any, files: any[]) => {
  if (!beforeUpload(file.raw)) {
    const index = files.findIndex((f) => f.uid === file.uid)
    if (index > -1) files.splice(index, 1)
    return
  }
  fileList.value = files
}

const handleFileRemove = (_file: any, files: any[]) => {
  fileList.value = files
}

const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${ASSIGNMENT_MAX_FILE_COUNT} 个文件`)
}

const handleSubmit = async () => {
  if (mySubmission.value) {
    ElMessage.error('该作业已提交，不能重复提交')
    return
  }
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传文件')
    return
  }
  if (isExpired.value) {
    ElMessage.error('作业已截止，无法提交')
    return
  }

  submitting.value = true
  uploadProgress.value = 0
  const totalFiles = fileList.value.length
  const uploadedUrls: string[] = []

  try {
    for (let i = 0; i < fileList.value.length; i += 1) {
      const file = fileList.value[i]
      currentUploadFile.value = file.name

      const formData = new FormData()
      formData.append('file', file.raw)

      const response = await api.post('/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const fileProgress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          uploadProgress.value = Math.round(((i * 100) + fileProgress) / totalFiles)
        },
      })

      const uploadedUrl = response.data?.url || response.data?.data?.url
      const uploadedFilename = response.data?.filename || response.data?.data?.filename || file.name
      if (!uploadedUrl) throw new Error('Upload url missing')
      uploadedUrls.push(uploadedUrl)
      ElMessage.success(`${uploadedFilename} 上传成功 (${i + 1}/${totalFiles})`)
    }

    const submitResponse = await api.post(`/assignments/${route.params.id}/submit`, {
      file_urls: uploadedUrls,
      comment: submitForm.value.comment,
    })

    ElMessage.success('作业提交成功')
    mySubmission.value = submitResponse.data
    fileList.value = []
    submitForm.value.comment = ''
    uploadProgress.value = 100
    uploadRef.value?.clearFiles()
    await loadMySubmission()
  } catch (error: any) {
    console.error('提交失败:', error)
    if (error.response?.status === 409) {
      await loadMySubmission()
      uploadRef.value?.clearFiles()
      fileList.value = []
      submitForm.value.comment = ''
    }
  } finally {
    submitting.value = false
    uploadProgress.value = 0
    currentUploadFile.value = ''
  }
}

const loadAssignment = async () => {
  loading.value = true
  try {
    const response = await api.get(`/assignments/${route.params.id}`)
    assignment.value = response.data
  } catch {
    ElMessage.error('加载作业信息失败')
    router.push(authStore.user?.role === 'admin' ? assignmentListPath.value : '/assignments')
  } finally {
    loading.value = false
  }
}

const loadAllSubmissions = async () => {
  if (authStore.user?.role !== 'admin') return
  loadingSubmissions.value = true
  try {
    const response = await api.get(`/assignments/${route.params.id}/all-status`)
    submittedList.value = response.data.submitted || []
    unsubmittedList.value = response.data.unsubmitted || []
  } catch (error) {
    console.error('加载提交列表失败', error)
    ElMessage.error('加载提交列表失败')
  } finally {
    loadingSubmissions.value = false
  }
}

const loadMySubmission = async () => {
  if (authStore.user?.role !== 'student') return
  try {
    const response = await api.get('/assignments/my-submissions')
    const payload = normalizeListPayload(response.data)
    const submissions = payload.data
    mySubmission.value =
      submissions.find((item: any) => String(item.assignment_id ?? item.assignmentId ?? item.id) === String(route.params.id)) ||
      null
  } catch (error) {
    console.error('加载我的提交失败', error)
  }
}

onMounted(() => {
  loadAssignment()
  if (authStore.user?.role === 'admin') loadAllSubmissions()
  else loadMySubmission()
})
</script>

<style scoped>
.assignment-detail {
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

.assignment-card,
.submissions-card,
.submit-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-header h2 {
  margin: 0;
  color: #22324c;
  font-size: 20px;
}

.content-block {
  margin-top: 18px;
}

.content-title {
  margin-bottom: 12px;
  color: #22324c;
  font-size: 16px;
  font-weight: 700;
}

.content-box {
  padding: 18px;
  border-radius: 22px;
  background: rgba(248, 250, 252, 0.88);
}

.attachments {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.88);
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submission-files {
  margin-top: 16px;
}

.upload-file-name {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

@media (max-width: 900px) {
  .module-heading,
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .heading-actions {
    justify-content: flex-start;
  }
}
</style>

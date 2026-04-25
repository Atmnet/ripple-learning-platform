<template>
  <div class="assignment-edit">
    <section class="module-heading">
      <div>
        <h1>编辑作业</h1>
        <p>更新作业标题、截止时间、描述和附件，保存后会立即同步到作业管理列表。</p>
      </div>
      <div class="heading-actions">
        <el-button @click="goBack">返回作业管理</el-button>
      </div>
    </section>

    <el-card class="form-card" v-loading="loading" shadow="never">
      <el-form
        ref="formRef"
        :model="assignmentForm"
        :rules="rules"
        label-width="100px"
        class="assignment-form"
      >
        <el-form-item label="作业标题" prop="title">
          <el-input
            v-model="assignmentForm.title"
            placeholder="请输入作业标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="assignmentForm.deadline"
            type="datetime"
            placeholder="选择截止日期"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="作业描述" prop="description">
          <el-input
            v-model="assignmentForm.description"
            type="textarea"
            :rows="6"
            placeholder="请输入作业描述、要求、评分标准等"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="附件" prop="file_urls">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :file-list="fileList"
            multiple
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Word、PPT、Excel、图片、压缩包等格式，可上传多个文件，单个文件大小不超过 50MB
              </div>
            </template>
          </el-upload>

          <div v-if="uploadedFiles.length > 0" class="uploaded-files">
            <div class="file-tag" v-for="(file, index) in uploadedFiles" :key="file.url">
              <el-icon><Document /></el-icon>
              <el-link :href="file.url" target="_blank" type="primary">{{ file.name }}</el-link>
              <el-icon class="remove-btn" @click="removeUploadedFile(index)"><Close /></el-icon>
            </div>
          </div>
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" :loading="submitting" @click="submitForm">保存修改</el-button>
          <el-button @click="goBack">取消</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { Document, Close } from '@element-plus/icons-vue'
import api from '../api'
import { useAuthStore } from '../stores/auth'
import { ASSIGNMENT_ALLOWED_FILE_TYPES, ASSIGNMENT_MAX_FILE_SIZE_MB } from '../constants/fileUpload'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const fileList = ref<UploadFile[]>([])
const uploadedFiles = ref<{ name: string; url: string }[]>([])

const assignmentId = route.params.id as string
const isAdminRoute = computed(() => route.path.startsWith('/admin/'))
const assignmentListPath = computed(() => (isAdminRoute.value ? '/admin/assignments' : '/assignments'))

const assignmentForm = reactive({
  title: '',
  description: '',
  deadline: '',
  file_urls: '' as string,
})

const uploadUrl = computed(() => '/api/upload')
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}))

const rules: FormRules = {
  title: [
    { required: true, message: '请输入作业标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
  description: [{ max: 2000, message: '描述最多 2000 个字符', trigger: 'blur' }],
}

const parseFileUrls = (value: string | null | undefined) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return [value]
  }
}

const getFileName = (url: string) => {
  try {
    const urlObj = new URL(url)
    return decodeURIComponent(urlObj.pathname.split('/').pop() || '附件')
  } catch {
    return decodeURIComponent(url.split('/').pop() || '附件')
  }
}

const syncFileUrls = () => {
  assignmentForm.file_urls = JSON.stringify(uploadedFiles.value.map((file) => file.url))
}

const loadAssignment = async () => {
  loading.value = true
  try {
    const response = await api.get(`/assignments/${assignmentId}`)
    const data = response.data
    assignmentForm.title = data.title
    assignmentForm.description = data.description || ''
    assignmentForm.deadline = data.deadline
    uploadedFiles.value = parseFileUrls(data.file_url).map((url: string) => ({
      name: getFileName(url),
      url,
    }))
    syncFileUrls()
  } catch {
    ElMessage.error('加载作业信息失败')
    router.push(assignmentListPath.value)
  } finally {
    loading.value = false
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

const handleUploadSuccess = (response: any, uploadFile: UploadFile) => {
  const uploadedUrl = response?.url || response?.data?.url
  const uploadedFilename = response?.filename || response?.data?.filename || uploadFile.name
  if (!uploadedUrl) {
    ElMessage.error('上传成功但未返回文件地址')
    return
  }
  uploadedFiles.value.push({
    name: uploadedFilename,
    url: uploadedUrl,
  })
  syncFileUrls()
  ElMessage.success(`${uploadedFilename} 上传成功`)
}

const handleUploadError = () => {
  ElMessage.error('文件上传失败')
}

const removeUploadedFile = async (index: number) => {
  const file = uploadedFiles.value[index]
  if (!file) return

  try {
    await api.delete('/upload', { data: { fileUrl: file.url } })
  } catch {
    ElMessage.warning('服务器文件删除失败，但已从列表中移除')
  }

  uploadedFiles.value.splice(index, 1)
  syncFileUrls()
}

const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      await api.put(`/assignments/${assignmentId}`, assignmentForm)
      ElMessage.success('作业更新成功')
      router.push(assignmentListPath.value)
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || '更新失败')
    } finally {
      submitting.value = false
    }
  })
}

const goBack = () => {
  router.push(assignmentListPath.value)
}

onMounted(() => {
  loadAssignment()
})
</script>

<style scoped>
.assignment-edit {
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

.form-card {
  max-width: 860px;
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.assignment-form {
  margin-top: 8px;
}

.upload-demo {
  width: 100%;
}

.uploaded-files {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(240, 249, 235, 0.9);
  border: 1px solid #e1f3d8;
  border-radius: 999px;
  font-size: 14px;
}

.remove-btn {
  cursor: pointer;
  color: #909399;
}

.remove-btn:hover {
  color: #f56c6c;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

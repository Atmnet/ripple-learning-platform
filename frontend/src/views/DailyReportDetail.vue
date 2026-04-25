<template>
  <div class="daily-report-detail">
    <section class="module-heading">
      <div>
        <h1>日报详情</h1>
        <p>查看日报内容、评论反馈与已读状态，所有处理都集中在同一块工作区里完成。</p>
      </div>
      <div class="heading-actions">
        <el-button v-if="isReportAuthor" type="primary" @click="handleEdit">编辑</el-button>
        <el-button v-if="isAdmin || isReportAuthor" type="danger" @click="handleDelete">删除</el-button>
      </div>
    </section>

    <el-card v-loading="loading" class="report-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>日报信息</span>
          <div class="header-tags">
            <el-tag v-if="isReportAuthor && report.reviewed_at" type="success">
              老师已阅 {{ formatDateTime(report.reviewed_at) }}
            </el-tag>
            <el-tag v-if="hasUnreadComments" type="warning">有新评论</el-tag>
            <el-tag type="success">已提交</el-tag>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="日报 ID">{{ report.id }}</el-descriptions-item>
        <el-descriptions-item label="提交日期">{{ formatDate(report.submit_date) }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatDateTime(report.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(report.updated_at) }}</el-descriptions-item>
      </el-descriptions>

      <div class="content-block">
        <div class="content-title">日报内容</div>
        <div class="content-box">
          <pre>{{ report.content || '暂无内容' }}</pre>
        </div>
      </div>
    </el-card>

    <el-card class="comments-card" :class="{ compact: comments.length === 0 }" shadow="never">
      <template #header>
        <div class="card-header">
          <span>评论与反馈</span>
          <el-badge :value="comments.length" :hidden="comments.length === 0" type="primary">
            <el-tag effect="plain">共 {{ comments.length }} 条评论</el-tag>
          </el-badge>
        </div>
      </template>

      <div v-if="comments.length === 0" class="empty-comments">
        <el-empty description="暂无评论" />
      </div>
      <div v-else class="comments-list">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
          :class="{
            'comment-own': comment.user_id === currentUserId,
            'comment-unread': comment.user_role === 'admin' && !comment.is_read && isReportAuthor,
          }"
        >
          <div class="comment-header-row">
            <div class="comment-user">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="user-name">{{ comment.user_name }}</span>
              <el-tag v-if="comment.user_role === 'admin'" size="small" type="warning">老师</el-tag>
              <el-tag v-else size="small" type="success">学员</el-tag>
              <el-tag
                v-if="comment.user_role === 'admin' && !comment.is_read && isReportAuthor"
                size="small"
                type="danger"
                effect="dark"
              >
                新
              </el-tag>
            </div>
            <span class="comment-time">{{ formatDateTime(comment.created_at) }}</span>
          </div>

          <div class="comment-content">
            <p v-if="!comment.isEditing">{{ comment.content }}</p>
            <div v-else>
              <el-input
                v-model="comment.editContent"
                type="textarea"
                :rows="3"
                placeholder="编辑评论内容"
              />
              <div class="edit-actions">
                <el-button type="primary" size="small" @click="saveEditComment(comment)">保存</el-button>
                <el-button size="small" @click="cancelEditComment(comment)">取消</el-button>
              </div>
            </div>
          </div>

          <div v-if="comment.user_id === currentUserId && !comment.isEditing" class="comment-actions">
            <el-button type="primary" link size="small" @click="startEditComment(comment)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDeleteComment(comment.id)">删除</el-button>
          </div>
        </div>
      </div>

      <div class="comment-form">
        <h4>发表评论</h4>
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="4"
          placeholder="请输入您的评论或反馈"
          maxlength="500"
          show-word-limit
        />
        <div class="form-actions">
          <el-button type="primary" :loading="submitting" @click="submitComment">发表评论</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import api from '../api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const authStore = useAuthStore()

const backRoute = computed(() => {
  if (route.query.from === 'admin') {
    return {
      path: '/admin/daily-reports',
      query: {
        date: route.query.date,
        status: route.query.status,
      },
    }
  }
  return '/daily-reports'
})

const report = ref({
  id: '',
  content: '',
  submit_date: '',
  created_at: '',
  updated_at: '',
  user_id: 0,
  reviewed_at: null,
  unread_comments: 0,
})

const comments = ref<any[]>([])
const newComment = ref('')
const submitting = ref(false)
const currentUserId = computed(() => authStore.user?.id || 0)
const isAdmin = computed(() => authStore.user?.role === 'admin')
const isReportAuthor = computed(() => report.value.user_id === currentUserId.value)
const hasUnreadComments = computed(() => {
  if (!isReportAuthor.value) return false
  return comments.value.some((c) => c.user_role === 'admin' && !c.is_read)
})

const formatDate = (dateString: string) => (!dateString ? '-' : new Date(dateString).toLocaleDateString('zh-CN'))
const formatDateTime = (dateString: string) => (!dateString ? '-' : new Date(dateString).toLocaleString('zh-CN'))

const fetchReportDetail = async () => {
  loading.value = true
  try {
    const response = await api.get(`/daily-reports/${route.params.id}`)
    report.value = response.data
    await fetchComments()
  } catch {
    ElMessage.error('获取日报详情失败')
    router.push(backRoute.value)
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    const response = await api.get(`/daily-reports/${route.params.id}/comments`)
    comments.value = response.data.map((c: any) => ({
      ...c,
      isEditing: false,
      editContent: '',
    }))
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    await api.post(`/daily-reports/${route.params.id}/comments`, {
      content: newComment.value.trim(),
    })
    ElMessage.success('评论发表成功')
    newComment.value = ''
    await fetchComments()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '评论发表失败')
  } finally {
    submitting.value = false
  }
}

const startEditComment = (comment: any) => {
  comment.isEditing = true
  comment.editContent = comment.content
}

const cancelEditComment = (comment: any) => {
  comment.isEditing = false
  comment.editContent = ''
}

const saveEditComment = async (comment: any) => {
  if (!comment.editContent.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    await api.put(`/daily-reports/${route.params.id}/comments/${comment.id}`, {
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
    await fetchComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

const handleEdit = () => {
  router.push('/daily-reports')
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这份日报吗？此操作不可恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await api.delete(`/daily-reports/${route.params.id}`)
    ElMessage.success('删除成功')
    router.push(backRoute.value)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

onMounted(() => {
  fetchReportDetail()
})
</script>

<style scoped>
.daily-report-detail {
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

.report-card,
.comments-card {
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

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.content-box pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  line-height: 1.7;
  color: #334155;
}

.comments-card.compact :deep(.el-card__body) {
  padding-top: 14px;
  padding-bottom: 16px;
}

.comments-card :deep(.el-badge__content) {
  box-shadow: none;
}

.empty-comments {
  padding: 6px 0 2px;
}

.empty-comments :deep(.el-empty) {
  padding: 6px 0 2px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  border-radius: 22px;
  background: rgba(248, 250, 252, 0.88);
  border-left: 3px solid #409eff;
  transition: all 0.3s;
}

.comment-item.comment-own {
  border-left-color: #67c23a;
}

.comment-item.comment-unread {
  border-left-color: #f56c6c;
  background: #fef0f0;
  box-shadow: 0 2px 12px rgba(245, 108, 108, 0.14);
}

.comment-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 600;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-content p {
  margin: 0;
}

.comment-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px dashed #dcdfe6;
}

.edit-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.comment-form {
  padding-top: 14px;
}

.comment-form h4 {
  margin: 0 0 14px;
  color: #22324c;
  font-size: 15px;
}

.form-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .heading-actions {
    justify-content: flex-start;
  }

  .card-header,
  .comment-header-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

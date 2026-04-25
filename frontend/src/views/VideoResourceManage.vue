<template>
  <div class="video-manage">
    <section class="module-heading">
      <div>
        <h1>视频资源管理</h1>
        <p>集中维护视频标题、分类、来源和播放地址，学员侧会直接读取这里的资源列表。</p>
      </div>
      <div class="heading-actions">
        <el-button @click="goBack">返回管理后台</el-button>
      </div>
    </section>

    <div class="manage-grid">
      <div class="left-column">
        <el-card class="guide-card" shadow="never">
          <template #header>
            <div class="card-title">填写说明</div>
          </template>
          <div class="guide-list">
            <p>1. 视频标题：学员看到的名称，建议直接写课程名或主题名。</p>
            <p>2. 分类：例如 知识学习、数据库、运维实战、面试准备。</p>
            <p>3. 第三方视频地址：填写完整 URL，普通 mp4 或 B 站视频页都可以。</p>
            <p>4. 来源名称：例如 B 站、腾讯课堂、企业录播、网盘直链。</p>
            <p>5. 时长：可写 18 分钟、1 小时 20 分钟 这类文本。</p>
            <p>6. 标签：多个标签用英文逗号分隔，例如 Linux, 网络, 排查。</p>
          </div>
          <el-alert
            type="warning"
            :closable="false"
            title="B 站支持直接粘贴普通视频链接，例如 https://www.bilibili.com/video/BV...，系统会自动转换成嵌入地址。"
          />
        </el-card>

        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-title">{{ editingId ? '编辑视频源' : '新增视频源' }}</div>
          </template>

          <el-form :model="form" label-position="top">
            <el-form-item label="视频标题">
              <el-input v-model="form.title" placeholder="例如：MySQL 查询优化入门" />
            </el-form-item>

            <el-form-item label="分类">
              <el-input v-model="form.category" placeholder="例如：数据库 / 知识学习 / 运维实战" />
            </el-form-item>

            <el-form-item label="第三方视频地址">
              <el-input v-model="form.embed_url" placeholder="例如：https://www.bilibili.com/video/BV... 或 https://xxx/video.mp4" />
            </el-form-item>

            <el-form-item label="来源名称">
              <el-input v-model="form.source_name" placeholder="例如：B 站 / 企业录播 / 网盘直链" />
            </el-form-item>

            <el-form-item label="时长">
              <el-input v-model="form.duration_text" placeholder="例如：18 分钟" />
            </el-form-item>

            <el-form-item label="标签">
              <el-input v-model="form.tags" placeholder="多个标签用英文逗号分隔" />
            </el-form-item>

            <el-form-item label="描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="简要说明这节视频讲什么、适合谁看、能学到什么"
              />
            </el-form-item>

            <div class="form-actions">
              <el-button @click="resetForm">重置</el-button>
              <el-button type="primary" :loading="saving" @click="submitForm">
                {{ editingId ? '保存修改' : '新增视频源' }}
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>

      <el-card class="table-card" shadow="never">
        <template #header>
          <div class="list-header">
            <span class="card-title">已配置视频源</span>
            <el-button link type="primary" @click="loadResources">刷新</el-button>
          </div>
        </template>

        <el-table :data="resources" v-loading="loading" style="width: 100%">
          <el-table-column prop="title" label="标题" min-width="200" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="source_name" label="来源" width="120" />
          <el-table-column prop="duration_text" label="时长" width="100" />
          <el-table-column label="标签" min-width="180">
            <template #default="{ row }">
              <div class="tag-wrap">
                <el-tag
                  v-for="tag in getTagList(row.tags)"
                  :key="tag"
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="startEdit(row)">编辑</el-button>
              <el-button link type="success" @click="preview(row.embed_url)">预览</el-button>
              <el-button link type="danger" @click="remove(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createVideoResource,
  deleteVideoResource,
  getVideoResources,
  updateVideoResource,
} from '../api/videoResources'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const resources = ref<any[]>([])

const createDefaultForm = () => ({
  title: '',
  category: '',
  description: '',
  embed_url: '',
  source_name: '',
  duration_text: '',
  tags: '',
})

const form = ref(createDefaultForm())

function goBack() {
  router.push('/admin')
}

function getTagList(tags: string | null | undefined) {
  return String(tags || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function loadResources() {
  loading.value = true
  try {
    const response = await getVideoResources()
    resources.value = response.data || []
  } catch (error) {
    console.error('Load video resources error:', error)
    ElMessage.error('加载视频源失败')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingId.value = null
  form.value = createDefaultForm()
}

function startEdit(row: any) {
  editingId.value = Number(row.id)
  form.value = {
    title: row.title || '',
    category: row.category || '',
    description: row.description || '',
    embed_url: row.embed_url || '',
    source_name: row.source_name || '',
    duration_text: row.duration_text || '',
    tags: row.tags || '',
  }
}

function preview(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

async function submitForm() {
  if (!form.value.title.trim() || !form.value.category.trim() || !form.value.embed_url.trim()) {
    ElMessage.error('标题、分类和第三方视频地址必填')
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await updateVideoResource(editingId.value, form.value)
      ElMessage.success('视频源已更新')
    } else {
      await createVideoResource(form.value)
      ElMessage.success('视频源已新增')
    }

    resetForm()
    loadResources()
  } catch (error: any) {
    console.error('Save video resource error:', error)
    ElMessage.error(error.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这条视频源吗？', '删除确认', {
      type: 'warning',
    })

    await deleteVideoResource(id)
    ElMessage.success('视频源已删除')

    if (editingId.value === id) {
      resetForm()
    }

    loadResources()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete video resource error:', error)
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

onMounted(() => {
  loadResources()
})
</script>

<style scoped>
.video-manage {
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

.manage-grid {
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  gap: 18px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.guide-card,
.form-card,
.table-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.card-title {
  color: #22324c;
  font-size: 16px;
  font-weight: 700;
}

.guide-list {
  margin-bottom: 16px;
  color: #606266;
  line-height: 1.8;
}

.guide-list p {
  margin: 0 0 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 1100px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .manage-grid {
    grid-template-columns: 1fr;
  }
}
</style>

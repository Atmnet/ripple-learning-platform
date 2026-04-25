<template>
  <div class="daily-reports-admin">
    <section class="module-heading">
      <div>
        <h1>日报管理</h1>
        <p>查看指定日期的日报提交状态、筛选已提交与未提交学员，并进入详情页继续处理。</p>
      </div>
      <div class="heading-actions">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button type="primary" :loading="loading" @click="loadData">刷新</el-button>
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
            <el-button v-if="row.has_submitted" type="primary" link @click="viewReport(row)">查看详情</el-button>
            <span v-else class="no-action">-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

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

const userList = ref<any[]>([])

const filteredList = computed(() => {
  if (filterStatus.value === 'all') return userList.value
  if (filterStatus.value === 'submitted') return userList.value.filter((u) => u.has_submitted)
  return userList.value.filter((u) => !u.has_submitted)
})

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

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
    ElMessage.error(error.response?.data?.error || '加载数据失败')
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

const viewReport = (row: any) => {
  if (row.report_id) {
    router.push({
      path: `/admin/daily-reports/${row.report_id}`,
      query: {
        from: 'admin',
        date: selectedDate.value,
        status: filterStatus.value,
      },
    })
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
  align-items: center;
  gap: 16px;
}

.list-title {
  color: #22324c;
  font-size: 18px;
  font-weight: 700;
}

.list-subtitle {
  margin-top: 6px;
  color: #75839a;
  font-size: 13px;
}

.no-action {
  color: #94a3b8;
}

@media (max-width: 900px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .heading-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<template>
  <div class="mock-admin-page">
    <section class="module-heading">
      <div>
        <h1>模拟面试管理</h1>
        <p>查看内置题库、历史训练报告和整体得分概览，保持训练模块的数据透明与可维护。</p>
      </div>
    </section>

    <section class="stats-row">
      <el-card class="stat-card" shadow="never">
        <div class="stat-value">{{ questions.length }}</div>
        <div class="stat-label">内置题库</div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-value">{{ reports.length }}</div>
        <div class="stat-label">面试报告</div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-value">{{ averageScore }}</div>
        <div class="stat-label">平均得分</div>
      </el-card>
    </section>

    <el-tabs class="content-tabs">
      <el-tab-pane label="题库">
        <el-card class="table-card" shadow="never">
          <el-table :data="questions" style="width: 100%">
            <el-table-column prop="category" label="分类" width="140" />
            <el-table-column prop="scene" label="场景" width="140" />
            <el-table-column prop="question" label="题目" min-width="260" />
            <el-table-column label="评分点" width="120">
              <template #default="{ row }">{{ row.corePoints?.length || 0 }} 个</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="报告">
        <el-card class="table-card" shadow="never">
          <el-table :data="reports" style="width: 100%">
            <el-table-column prop="userName" label="学员" width="140" />
            <el-table-column prop="title" label="面试主题" min-width="220" />
            <el-table-column prop="questionCount" label="题目数" width="100" />
            <el-table-column label="得分" width="100">
              <template #default="{ row }">
                <el-tag :type="row.score >= 80 ? 'success' : row.score >= 60 ? 'warning' : 'danger'">
                  {{ row.score }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="时间" width="180">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAdminMockInterviewQuestions, getAdminMockInterviewReports, type MockInterviewReport } from '../api/mockInterview'
import { normalizeListPayload } from '../utils/apiResponse'

const questions = ref<any[]>([])
const reports = ref<MockInterviewReport[]>([])

const averageScore = computed(() => {
  if (!reports.value.length) return 0
  return Math.round(reports.value.reduce((sum, item) => sum + item.score, 0) / reports.value.length)
})

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN')
}

async function loadData() {
  const [questionRes, reportRes] = await Promise.all([
    getAdminMockInterviewQuestions(),
    getAdminMockInterviewReports(),
  ])

  questions.value = normalizeListPayload(questionRes.data.data ?? questionRes.data).data
  reports.value = normalizeListPayload(reportRes.data.data ?? reportRes.data).data
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.mock-admin-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.stat-card,
.table-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.stat-value {
  color: #409eff;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
}

.stat-label {
  margin-top: 8px;
  text-align: center;
  color: #6b7280;
}

.content-tabs {
  margin-top: 2px;
}

@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>

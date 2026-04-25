<template>
  <div class="admin-dashboard-page">
    <section class="module-heading">
      <div>
        <h1>管理后台</h1>
        <p>汇总今日日常待办、提交趋势和活跃排行，帮助我们更快判断后台当前最需要处理的事情。</p>
      </div>
      <div class="heading-actions">
        <el-segmented v-model="rangeDays" :options="rangeOptions" @change="refreshDashboard" />
        <el-button type="primary" :loading="loading" @click="refreshDashboard">刷新数据</el-button>
      </div>
    </section>

    <section class="metric-grid" v-loading="loading">
      <article v-for="card in overviewCards" :key="card.key" class="metric-card" :class="card.theme">
        <div class="metric-head">
          <div class="metric-icon">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <span class="metric-tag">{{ card.tag }}</span>
        </div>
        <div class="metric-value">{{ card.value }}</div>
        <div class="metric-label">{{ card.label }}</div>
        <div class="metric-desc">{{ card.desc }}</div>
      </article>
    </section>

    <section class="dashboard-grid top" v-loading="loading">
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-head">
            <div>
              <div class="panel-title">今日待处理事项</div>
              <div class="panel-subtitle">优先查看这些数据，可以更快安排今天的后台工作。</div>
            </div>
          </div>
        </template>

        <div class="todo-list">
          <div class="todo-item danger">
            <span>未交日报</span>
            <strong>{{ dashboard.pending.unsubmittedReports }}</strong>
          </div>
          <div class="todo-item warning">
            <span>作业待提交</span>
            <strong>{{ dashboard.pending.assignmentsPendingSubmission }}</strong>
          </div>
          <div class="todo-item info">
            <span>作业待批改</span>
            <strong>{{ dashboard.pending.assignmentsPendingReview }}</strong>
          </div>
          <div class="todo-item accent">
            <span>考试进行中</span>
            <strong>{{ dashboard.pending.examsInProgress }}</strong>
          </div>
          <div class="todo-item neutral">
            <span>待开始考试</span>
            <strong>{{ dashboard.pending.publishedUpcomingExams }}</strong>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-head">
            <div>
              <div class="panel-title">系统概览</div>
              <div class="panel-subtitle">快速查看当前平台资源和核心统计。</div>
            </div>
          </div>
        </template>

        <div class="system-list">
          <div class="system-row">
            <span>学员总数</span>
            <strong>{{ dashboard.overview.studentCount }}</strong>
          </div>
          <div class="system-row">
            <span>近 {{ dashboard.rangeDays }} 天活跃学员</span>
            <strong>{{ dashboard.overview.activeStudentCount }}</strong>
          </div>
          <div class="system-row">
            <span>视频资源</span>
            <strong>{{ dashboard.overview.videoCount }}</strong>
          </div>
          <div class="system-row">
            <span>考试平均分</span>
            <strong>{{ dashboard.overview.averageExamScore }}</strong>
          </div>
          <div class="system-row">
            <span>管理员数量</span>
            <strong>{{ dashboard.overview.adminCount }}</strong>
          </div>
        </div>
      </el-card>
    </section>

    <section class="dashboard-grid middle" v-loading="loading">
      <el-card class="panel-card chart-card" shadow="never">
        <template #header>
          <div class="panel-head">
            <div>
              <div class="panel-title">近 {{ dashboard.rangeDays }} 天趋势</div>
              <div class="panel-subtitle">日报、作业和考试完成情况按时间连续展示。</div>
            </div>
          </div>
        </template>

        <div class="line-chart-wrap">
          <svg viewBox="0 0 640 250" class="line-chart" preserveAspectRatio="none">
            <g class="grid-lines">
              <line v-for="y in [40, 90, 140, 190, 240]" :key="y" x1="24" :y1="y" x2="616" :y2="y" />
            </g>
            <polyline class="line report" :points="reportLinePoints" />
            <polyline class="line assignment" :points="assignmentLinePoints" />
            <polyline class="line exam" :points="examLinePoints" />
            <g class="point-group report">
              <circle v-for="point in reportPoints" :key="`r-${point.x}`" :cx="point.x" :cy="point.y" r="4" />
            </g>
            <g class="point-group assignment">
              <circle v-for="point in assignmentPoints" :key="`a-${point.x}`" :cx="point.x" :cy="point.y" r="4" />
            </g>
            <g class="point-group exam">
              <circle v-for="point in examPoints" :key="`e-${point.x}`" :cx="point.x" :cy="point.y" r="4" />
            </g>
          </svg>

          <div class="x-axis">
            <span v-for="item in trendSeries" :key="item.date">{{ item.label }}</span>
          </div>
        </div>

        <div class="legend">
          <span><i class="legend-dot report" /> 日报</span>
          <span><i class="legend-dot assignment" /> 作业</span>
          <span><i class="legend-dot exam" /> 考试完成</span>
        </div>
      </el-card>

      <el-card class="panel-card ranking-card" shadow="never">
        <template #header>
          <div class="panel-head">
            <div>
              <div class="panel-title">活跃学员排行</div>
              <div class="panel-subtitle">综合日报、作业和考试参与情况得出活跃分。</div>
            </div>
          </div>
        </template>

        <div class="ranking-list">
          <div v-for="(item, index) in dashboard.rankings" :key="item.userId" class="ranking-row">
            <div class="ranking-left">
              <div class="ranking-index">{{ index + 1 }}</div>
              <div>
                <div class="ranking-name">{{ item.realName || item.username }}</div>
                <div class="ranking-account">{{ item.username }}</div>
              </div>
            </div>
            <div class="ranking-meta">
              <span>日报 {{ item.reportCount }}</span>
              <span>作业 {{ item.submissionCount }}</span>
              <span>均分 {{ item.averageScore }}</span>
            </div>
            <div class="ranking-score">{{ item.activityScore }}</div>
          </div>
          <el-empty v-if="dashboard.rankings.length === 0" description="暂无排行数据" />
        </div>
      </el-card>
    </section>

    <section class="dashboard-grid bottom" v-loading="loading">
      <el-card class="panel-card progress-card" shadow="never">
        <template #header>
          <div class="panel-head">
            <div>
              <div class="panel-title">今日日报</div>
              <div class="panel-subtitle">今日日报提交覆盖率</div>
            </div>
            <el-tag :type="todayReportTagType">{{ dashboard.today.reportSubmissionRate }}%</el-tag>
          </div>
        </template>

        <div class="big-progress-value">{{ dashboard.today.reportSubmittedCount }} / {{ dashboard.overview.studentCount }}</div>
        <el-progress :percentage="dashboard.today.reportSubmissionRate" :stroke-width="14" :show-text="false" />
        <div class="progress-footer">
          <span>已提交 {{ dashboard.today.reportSubmittedCount }}</span>
          <span>待补交 {{ dashboard.today.reportPendingCount }}</span>
        </div>
      </el-card>

      <el-card class="panel-card progress-card" shadow="never">
        <template #header>
          <div class="panel-head">
            <div>
              <div class="panel-title">作业提交</div>
              <div class="panel-subtitle">未截止作业的整体完成进度</div>
            </div>
            <el-tag :type="todayAssignmentTagType">{{ dashboard.today.assignmentSubmissionRate }}%</el-tag>
          </div>
        </template>

        <div class="big-progress-value">{{ dashboard.today.assignmentSubmittedCount }} / {{ assignmentExpectedTotal }}</div>
        <el-progress
          :percentage="dashboard.today.assignmentSubmissionRate"
          :stroke-width="14"
          :show-text="false"
          status="success"
        />
        <div class="progress-footer">
          <span>未截止作业 {{ dashboard.today.assignmentsDueCount }}</span>
          <span>待提交 {{ dashboard.today.assignmentPendingCount }}</span>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, EditPen, Reading, Trophy, User } from '@element-plus/icons-vue'
import { getAdminDashboard } from '../api/adminDashboard'

const loading = ref(false)
const rangeDays = ref(7)
const rangeOptions = [
  { label: '7 天', value: 7 },
  { label: '14 天', value: 14 },
  { label: '30 天', value: 30 },
]

const dashboard = reactive({
  rangeDays: 7,
  overview: {
    studentCount: 0,
    adminCount: 0,
    activeStudentCount: 0,
    videoCount: 0,
    averageExamScore: 0,
  },
  today: {
    date: '',
    reportSubmittedCount: 0,
    reportPendingCount: 0,
    reportSubmissionRate: 0,
    assignmentsDueCount: 0,
    assignmentSubmittedCount: 0,
    assignmentPendingCount: 0,
    assignmentSubmissionRate: 0,
    activeExamCount: 0,
    publishedExamCount: 0,
  },
  pending: {
    unsubmittedReports: 0,
    assignmentsPendingSubmission: 0,
    assignmentsPendingReview: 0,
    examsInProgress: 0,
    publishedUpcomingExams: 0,
  },
  trends: [] as Array<{ date: string; reportCount: number; submissionCount: number; examCompletionCount: number }>,
  rankings: [] as Array<{
    userId: number
    realName: string
    username: string
    reportCount: number
    submissionCount: number
    averageScore: number
    activityScore: number
  }>,
})

const assignmentExpectedTotal = computed(() => dashboard.today.assignmentsDueCount * dashboard.overview.studentCount)

const todayReportTagType = computed(() => {
  if (dashboard.today.reportSubmissionRate >= 85) return 'success'
  if (dashboard.today.reportSubmissionRate >= 60) return 'warning'
  return 'danger'
})

const todayAssignmentTagType = computed(() => {
  if (dashboard.today.assignmentSubmissionRate >= 85) return 'success'
  if (dashboard.today.assignmentSubmissionRate >= 60) return 'warning'
  return 'danger'
})

const overviewCards = computed(() => [
  {
    key: 'students',
    label: '学员总数',
    value: dashboard.overview.studentCount,
    desc: `近 ${dashboard.rangeDays} 天活跃 ${dashboard.overview.activeStudentCount} 人`,
    tag: '用户',
    icon: User,
    theme: 'ocean',
  },
  {
    key: 'reports',
    label: '今日日报提交率',
    value: `${dashboard.today.reportSubmissionRate}%`,
    desc: `已交 ${dashboard.today.reportSubmittedCount}，未交 ${dashboard.today.reportPendingCount}`,
    tag: '日报',
    icon: Document,
    theme: 'emerald',
  },
  {
    key: 'assignments',
    label: '作业待处理',
    value: dashboard.pending.assignmentsPendingReview,
    desc: `待提交 ${dashboard.pending.assignmentsPendingSubmission} 份`,
    tag: '作业',
    icon: Reading,
    theme: 'amber',
  },
  {
    key: 'exams',
    label: '考试状态',
    value: dashboard.today.activeExamCount,
    desc: `已发布 ${dashboard.today.publishedExamCount} 场，均分 ${dashboard.overview.averageExamScore}`,
    tag: '考试',
    icon: EditPen,
    theme: 'rose',
  },
  {
    key: 'rank',
    label: '活跃排行第一',
    value: dashboard.rankings[0]?.realName || '-',
    desc: dashboard.rankings[0] ? `综合活跃值 ${dashboard.rankings[0].activityScore}` : '暂无排行数据',
    tag: '排行',
    icon: Trophy,
    theme: 'violet',
  },
])

const trendSeries = computed(() =>
  dashboard.trends.map((item) => ({
    ...item,
    label: item.date.slice(5),
  })),
)

const maxTrendValue = computed(() =>
  Math.max(1, ...dashboard.trends.flatMap((item) => [item.reportCount, item.submissionCount, item.examCompletionCount])),
)

function buildPoints(values: number[]) {
  if (values.length === 0) return []
  const startX = 36
  const endX = 604
  const width = endX - startX
  const step = values.length === 1 ? 0 : width / (values.length - 1)

  return values.map((value, index) => {
    const ratio = value / maxTrendValue.value
    return {
      x: Number((startX + step * index).toFixed(2)),
      y: Number((224 - ratio * 180).toFixed(2)),
    }
  })
}

const reportPoints = computed(() => buildPoints(dashboard.trends.map((item) => item.reportCount)))
const assignmentPoints = computed(() => buildPoints(dashboard.trends.map((item) => item.submissionCount)))
const examPoints = computed(() => buildPoints(dashboard.trends.map((item) => item.examCompletionCount)))

const reportLinePoints = computed(() => reportPoints.value.map((item) => `${item.x},${item.y}`).join(' '))
const assignmentLinePoints = computed(() => assignmentPoints.value.map((item) => `${item.x},${item.y}`).join(' '))
const examLinePoints = computed(() => examPoints.value.map((item) => `${item.x},${item.y}`).join(' '))

async function refreshDashboard() {
  loading.value = true
  try {
    const response = await getAdminDashboard({ rangeDays: rangeDays.value })
    const data = response.data?.data || response.data

    dashboard.rangeDays = Number(data.rangeDays || rangeDays.value)
    Object.assign(dashboard.overview, data.overview || {})
    Object.assign(dashboard.today, data.today || {})
    Object.assign(dashboard.pending, data.pending || {})
    dashboard.trends = Array.isArray(data.trends) ? data.trends : []
    dashboard.rankings = Array.isArray(data.rankings) ? data.rankings : []
  } catch (error) {
    console.error('加载后台面板失败', error)
    ElMessage.error('加载后台面板失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshDashboard()
})
</script>

<style scoped>
.admin-dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.module-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.module-heading h1 {
  margin: 0;
  color: #16233b;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.module-heading p {
  margin: 10px 0 0;
  max-width: 720px;
  color: #627089;
  font-size: 13px;
  line-height: 1.65;
}

.heading-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  padding: 22px;
  border-radius: 28px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 32px rgba(148, 163, 184, 0.12);
}

.metric-card.ocean { background-image: linear-gradient(145deg, rgba(241, 247, 255, 0.68), rgba(224, 236, 255, 0.2)); }
.metric-card.emerald { background-image: linear-gradient(145deg, rgba(241, 255, 248, 0.7), rgba(225, 255, 239, 0.22)); }
.metric-card.amber { background-image: linear-gradient(145deg, rgba(255, 250, 241, 0.72), rgba(255, 240, 214, 0.2)); }
.metric-card.rose { background-image: linear-gradient(145deg, rgba(255, 245, 246, 0.72), rgba(255, 226, 229, 0.18)); }
.metric-card.violet { background-image: linear-gradient(145deg, rgba(248, 245, 255, 0.72), rgba(229, 220, 255, 0.18)); }

.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #2f5ccf;
  background: rgba(255, 255, 255, 0.44);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
  font-size: 18px;
}

.metric-tag {
  color: #708099;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-value {
  margin-top: 18px;
  color: #22324c;
  font-size: 34px;
  font-weight: 800;
}

.metric-label {
  margin-top: 10px;
  color: #243a58;
  font-size: 15px;
  font-weight: 700;
}

.metric-desc {
  margin-top: 8px;
  color: #708098;
  font-size: 13px;
  line-height: 1.7;
}

.dashboard-grid {
  display: grid;
  gap: 18px;
}

.dashboard-grid.top {
  grid-template-columns: 1.2fr 0.9fr;
}

.dashboard-grid.middle {
  grid-template-columns: 1.6fr 1fr;
}

.dashboard-grid.bottom {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.panel-card {
  border-radius: 28px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.panel-card :deep(.el-card__body) {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-title {
  color: #22324c;
  font-size: 19px;
  font-weight: 700;
}

.panel-subtitle {
  margin-top: 6px;
  color: #75839a;
  font-size: 13px;
}

.todo-list,
.system-list,
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.todo-item,
.system-row,
.ranking-row {
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.74);
}

.todo-item.danger { background: rgba(255, 235, 235, 0.48); color: #ab3030; }
.todo-item.warning { background: rgba(255, 246, 224, 0.52); color: #9a6c03; }
.todo-item.info { background: rgba(236, 244, 255, 0.52); color: #3359b8; }
.todo-item.accent { background: rgba(243, 240, 255, 0.5); color: #5349b7; }
.todo-item.neutral { background: rgba(241, 244, 248, 0.52); color: #475569; }

.todo-item strong,
.system-row strong {
  font-size: 20px;
  color: #22324c;
}

.system-row {
  background: rgba(255, 255, 255, 0.42);
  color: #4f6077;
}

.line-chart-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.line-chart {
  width: 100%;
  height: 260px;
}

.grid-lines line {
  stroke: rgba(112, 130, 165, 0.2);
  stroke-dasharray: 5 7;
}

.line {
  fill: none;
  stroke-width: 4.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 8px 16px rgba(120, 145, 190, 0.18));
}

.line.report { stroke: #4f7cff; }
.line.assignment { stroke: #21b185; }
.line.exam { stroke: #f59e0b; }

.point-group circle {
  fill: rgba(255, 255, 255, 0.92);
  stroke-width: 3;
}

.point-group.report circle { stroke: #4f7cff; }
.point-group.assignment circle { stroke: #21b185; }
.point-group.exam circle { stroke: #f59e0b; }

.x-axis {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
  color: #71829a;
  font-size: 12px;
}

.legend {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: #576980;
  font-size: 13px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 8px;
  border-radius: 50%;
}

.legend-dot.report { background: #4f7cff; }
.legend-dot.assignment { background: #21b185; }
.legend-dot.exam { background: #f59e0b; }

.ranking-row {
  background: rgba(255, 255, 255, 0.42);
  gap: 14px;
}

.ranking-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-index {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.54);
  color: #315fd5;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.ranking-name {
  color: #22324c;
  font-weight: 700;
}

.ranking-account {
  margin-top: 4px;
  color: #7c8aa0;
  font-size: 12px;
}

.ranking-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #66768f;
  font-size: 12px;
}

.ranking-score {
  min-width: 52px;
  text-align: right;
  color: #22324c;
  font-size: 24px;
  font-weight: 800;
}

.big-progress-value {
  color: #22324c;
  font-size: 32px;
  font-weight: 800;
}

.progress-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #6f8098;
  font-size: 13px;
}

@media (max-width: 1440px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1200px) {
  .dashboard-grid.top,
  .dashboard-grid.middle,
  .dashboard-grid.bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 880px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .heading-actions {
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .ranking-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .ranking-score {
    text-align: left;
  }

  .heading-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

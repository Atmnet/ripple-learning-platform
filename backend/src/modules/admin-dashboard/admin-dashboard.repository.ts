import pool from '../../config/database'

export interface DashboardOverview {
  studentCount: number
  adminCount: number
  activeStudentCount: number
  videoCount: number
  averageExamScore: number
}

export interface DashboardToday {
  date: string
  reportSubmittedCount: number
  reportPendingCount: number
  reportSubmissionRate: number
  assignmentsDueCount: number
  assignmentSubmittedCount: number
  assignmentPendingCount: number
  assignmentSubmissionRate: number
  activeExamCount: number
  publishedExamCount: number
}

export interface DashboardPending {
  unsubmittedReports: number
  assignmentsPendingSubmission: number
  assignmentsPendingReview: number
  examsInProgress: number
  publishedUpcomingExams: number
}

export interface DashboardTrendPoint {
  date: string
  reportCount: number
  submissionCount: number
  examCompletionCount: number
}

export interface DashboardModuleStat {
  key: string
  label: string
  count: number
  detail: string
}

export interface DashboardRankingItem {
  userId: number
  realName: string
  username: string
  reportCount: number
  submissionCount: number
  averageScore: number
  activityScore: number
}

export interface DashboardSnapshot {
  rangeDays: number
  overview: DashboardOverview
  today: DashboardToday
  pending: DashboardPending
  trends: DashboardTrendPoint[]
  modules: DashboardModuleStat[]
  rankings: DashboardRankingItem[]
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function roundRate(numerator: number, denominator: number) {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 100)
}

function normalizeRangeDays(days?: number) {
  const allowed = new Set([7, 14, 30])
  return allowed.has(Number(days)) ? Number(days) : 7
}

export class AdminDashboardRepository {
  async getSnapshot(inputDays?: number): Promise<DashboardSnapshot> {
    const rangeDays = normalizeRangeDays(inputDays)
    const now = new Date()
    const today = toDateKey(now)
    const rangeStartDate = new Date(now)
    rangeStartDate.setDate(rangeStartDate.getDate() - (rangeDays - 1))
    const rangeStartKey = toDateKey(rangeStartDate)

    const [
      userCountsRows,
      videoCountRows,
      averageExamScoreRows,
      todayReportRows,
      dueAssignmentsRows,
      pendingReviewRows,
      examRows,
      activeStudentRows,
      trendReportRows,
      trendSubmissionRows,
      trendExamRows,
      moduleCountsRows,
      rankingRows,
    ] = await Promise.all([
      pool.query(`
        SELECT
          SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS studentCount,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS adminCount
        FROM users
      `),
      pool.query(`SELECT COUNT(*) AS videoCount FROM video_resources`),
      pool.query(`
        SELECT COALESCE(ROUND(AVG(score)), 0) AS averageExamScore
        FROM linux_student_exams
        WHERE status = 'completed' AND score IS NOT NULL
      `),
      pool.query(`
        SELECT COUNT(DISTINCT user_id) AS reportSubmittedCount
        FROM daily_reports
        WHERE DATE(created_at) = ?
      `, [today]),
      pool.query(`
        SELECT
          COUNT(*) AS assignmentsDueCount,
          COALESCE(SUM(submission_count), 0) AS assignmentSubmittedCount,
          COALESCE(SUM(GREATEST(total_students - submission_count, 0)), 0) AS assignmentPendingCount
        FROM (
          SELECT
            a.id,
            (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id) AS submission_count,
            (SELECT COUNT(*) FROM users u WHERE u.role = 'student') AS total_students
          FROM assignments a
          WHERE DATE(a.deadline) >= ?
        ) t
      `, [today]),
      pool.query(`
        SELECT COUNT(*) AS assignmentsPendingReview
        FROM assignment_submissions
        WHERE grade IS NULL
      `),
      pool.query(`
        SELECT
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS publishedExamCount,
          SUM(
            CASE
              WHEN status = 'published'
                AND start_time IS NOT NULL
                AND end_time IS NOT NULL
                AND start_time <= NOW()
                AND end_time >= NOW()
              THEN 1 ELSE 0
            END
          ) AS activeExamCount,
          SUM(
            CASE
              WHEN status = 'published'
                AND start_time IS NOT NULL
                AND start_time > NOW()
              THEN 1 ELSE 0
            END
          ) AS upcomingExamCount
        FROM linux_exams
      `),
      pool.query(`
        SELECT COUNT(DISTINCT user_id) AS activeStudentCount
        FROM (
          SELECT user_id FROM daily_reports WHERE DATE(created_at) >= ?
          UNION
          SELECT user_id FROM assignment_submissions WHERE DATE(submitted_at) >= ?
          UNION
          SELECT student_id AS user_id FROM linux_student_exams WHERE DATE(created_at) >= ?
        ) t
      `, [rangeStartKey, rangeStartKey, rangeStartKey]),
      pool.query(`
        SELECT DATE(created_at) AS statDate, COUNT(*) AS reportCount
        FROM daily_reports
        WHERE DATE(created_at) >= ?
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `, [rangeStartKey]),
      pool.query(`
        SELECT DATE(submitted_at) AS statDate, COUNT(*) AS submissionCount
        FROM assignment_submissions
        WHERE DATE(submitted_at) >= ?
        GROUP BY DATE(submitted_at)
        ORDER BY DATE(submitted_at)
      `, [rangeStartKey]),
      pool.query(`
        SELECT DATE(end_time) AS statDate, COUNT(*) AS examCompletionCount
        FROM linux_student_exams
        WHERE status = 'completed' AND DATE(end_time) >= ?
        GROUP BY DATE(end_time)
        ORDER BY DATE(end_time)
      `, [rangeStartKey]),
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE role = 'student') AS studentCount,
          (SELECT COUNT(*) FROM daily_reports) AS reportCount,
          (SELECT COUNT(*) FROM assignments) AS assignmentCount,
          (SELECT COUNT(*) FROM linux_exams) AS examCount,
          (SELECT COUNT(*) FROM video_resources) AS videoCount
      `),
      pool.query(`
        SELECT
          u.id AS userId,
          u.real_name AS realName,
          u.username,
          COALESCE(dr.reportCount, 0) AS reportCount,
          COALESCE(asu.submissionCount, 0) AS submissionCount,
          COALESCE(ex.averageScore, 0) AS averageScore,
          (
            COALESCE(dr.reportCount, 0) * 3 +
            COALESCE(asu.submissionCount, 0) * 4 +
            COALESCE(ex.completedCount, 0) * 5
          ) AS activityScore
        FROM users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS reportCount
          FROM daily_reports
          WHERE DATE(created_at) >= ?
          GROUP BY user_id
        ) dr ON dr.user_id = u.id
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS submissionCount
          FROM assignment_submissions
          WHERE DATE(submitted_at) >= ?
          GROUP BY user_id
        ) asu ON asu.user_id = u.id
        LEFT JOIN (
          SELECT
            student_id,
            COUNT(*) AS completedCount,
            ROUND(AVG(score), 0) AS averageScore
          FROM linux_student_exams
          WHERE status = 'completed' AND DATE(created_at) >= ?
          GROUP BY student_id
        ) ex ON ex.student_id = u.id
        WHERE u.role = 'student'
        ORDER BY activityScore DESC, averageScore DESC, realName ASC
        LIMIT 6
      `, [rangeStartKey, rangeStartKey, rangeStartKey]),
    ])

    const userCounts = (userCountsRows as any)[0][0] || {}
    const videoCounts = (videoCountRows as any)[0][0] || {}
    const averageExamScoreData = (averageExamScoreRows as any)[0][0] || {}
    const todayReportData = (todayReportRows as any)[0][0] || {}
    const dueAssignmentsData = (dueAssignmentsRows as any)[0][0] || {}
    const pendingReviewData = (pendingReviewRows as any)[0][0] || {}
    const examData = (examRows as any)[0][0] || {}
    const activeStudentData = (activeStudentRows as any)[0][0] || {}
    const moduleCounts = (moduleCountsRows as any)[0][0] || {}

    const studentCount = Number(userCounts.studentCount || 0)
    const reportSubmittedCount = Number(todayReportData.reportSubmittedCount || 0)
    const assignmentsDueCount = Number(dueAssignmentsData.assignmentsDueCount || 0)
    const assignmentSubmittedCount = Number(dueAssignmentsData.assignmentSubmittedCount || 0)
    const assignmentPendingCount = Number(dueAssignmentsData.assignmentPendingCount || 0)

    const reportPendingCount = Math.max(studentCount - reportSubmittedCount, 0)
    const reportSubmissionRate = roundRate(reportSubmittedCount, studentCount)
    const assignmentBase = assignmentsDueCount * studentCount
    const assignmentSubmissionRate = roundRate(assignmentSubmittedCount, assignmentBase)

    const reportTrendMap = new Map<string, number>()
    for (const row of (trendReportRows as any)[0] || []) {
      reportTrendMap.set(toDateKey(new Date(row.statDate)), Number(row.reportCount || 0))
    }

    const submissionTrendMap = new Map<string, number>()
    for (const row of (trendSubmissionRows as any)[0] || []) {
      submissionTrendMap.set(toDateKey(new Date(row.statDate)), Number(row.submissionCount || 0))
    }

    const examTrendMap = new Map<string, number>()
    for (const row of (trendExamRows as any)[0] || []) {
      examTrendMap.set(toDateKey(new Date(row.statDate)), Number(row.examCompletionCount || 0))
    }

    const trends: DashboardTrendPoint[] = []
    for (let i = rangeDays - 1; i >= 0; i -= 1) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = toDateKey(date)
      trends.push({
        date: key,
        reportCount: reportTrendMap.get(key) || 0,
        submissionCount: submissionTrendMap.get(key) || 0,
        examCompletionCount: examTrendMap.get(key) || 0,
      })
    }

    return {
      rangeDays,
      overview: {
        studentCount,
        adminCount: Number(userCounts.adminCount || 0),
        activeStudentCount: Number(activeStudentData.activeStudentCount || 0),
        videoCount: Number(videoCounts.videoCount || 0),
        averageExamScore: Number(averageExamScoreData.averageExamScore || 0),
      },
      today: {
        date: today,
        reportSubmittedCount,
        reportPendingCount,
        reportSubmissionRate,
        assignmentsDueCount,
        assignmentSubmittedCount,
        assignmentPendingCount,
        assignmentSubmissionRate,
        activeExamCount: Number(examData.activeExamCount || 0),
        publishedExamCount: Number(examData.publishedExamCount || 0),
      },
      pending: {
        unsubmittedReports: reportPendingCount,
        assignmentsPendingSubmission: assignmentPendingCount,
        assignmentsPendingReview: Number(pendingReviewData.assignmentsPendingReview || 0),
        examsInProgress: Number(examData.activeExamCount || 0),
        publishedUpcomingExams: Number(examData.upcomingExamCount || 0),
      },
      trends,
      modules: [
        { key: 'students', label: '学员管理', count: Number(moduleCounts.studentCount || 0), detail: '账号、角色与重置密码' },
        { key: 'reports', label: '日报管理', count: Number(moduleCounts.reportCount || 0), detail: '提交记录、批注与点评' },
        { key: 'assignments', label: '作业管理', count: Number(moduleCounts.assignmentCount || 0), detail: '发布、批改与提交追踪' },
        { key: 'exams', label: '考试管理', count: Number(moduleCounts.examCount || 0), detail: '发布状态、结果与进行中监控' },
        { key: 'videos', label: '视频资源', count: Number(moduleCounts.videoCount || 0), detail: '课程视频、分类与播放入口' },
      ],
      rankings: ((rankingRows as any)[0] || []).map((row: any) => ({
        userId: Number(row.userId || 0),
        realName: String(row.realName || ''),
        username: String(row.username || ''),
        reportCount: Number(row.reportCount || 0),
        submissionCount: Number(row.submissionCount || 0),
        averageScore: Number(row.averageScore || 0),
        activityScore: Number(row.activityScore || 0),
      })),
    }
  }
}

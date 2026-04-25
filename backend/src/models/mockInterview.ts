export interface InterviewCategory {
  key: string
  name: string
  description: string
}

export interface ScoringPoint {
  label: string
  keywords: string[]
  suggestion: string
}

export interface InterviewQuestion {
  id: number
  category: string
  question: string
  scene: string
  referenceAnswer: string
  corePoints: ScoringPoint[]
  bonusPoints?: string[]
  mistakeKeywords?: string[]
}

export interface SessionQuestion {
  id: number
  category: string
  question: string
  scene: string
}

export interface SessionAnswer {
  questionId: number
  answer: string
}

export interface AnswerEvaluation {
  questionId: number
  question: string
  category: string
  answer: string
  score: number
  coverageScore: number
  structureScore: number
  practiceScore: number
  riskPenalty: number
  matchedPoints: string[]
  missingPoints: string[]
  suggestions: string[]
  summary: string
}

export interface InterviewReport {
  id: string
  sessionId: string
  userId: number
  userName: string
  title: string
  category: string
  score: number
  questionCount: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  answers: AnswerEvaluation[]
  createdAt: string
}

interface InterviewSession {
  id: string
  userId: number
  userName: string
  category: string
  title: string
  questions: InterviewQuestion[]
  createdAt: string
}

const categories: InterviewCategory[] = [
  { key: 'linux', name: 'Linux 运维', description: '系统、服务与故障排查' },
  { key: 'mysql', name: 'MySQL 数据库', description: '数据库基础、优化与排查' },
  { key: 'behavior', name: '行为与项目表达', description: '项目经历、沟通表达与复盘' }
]

const questionBank: InterviewQuestion[] = [
  {
    id: 1,
    category: 'linux',
    scene: '故障排查',
    question: '线上 Linux 服务器 CPU 飙高时，你会怎么排查？',
    referenceAnswer: '先确认现象范围，再用 top、uptime、vmstat 等定位高负载进程，结合日志与最近变更分析原因，最后处理并验证恢复。',
    corePoints: [
      { label: '先确认现象与影响范围', keywords: ['现象', '影响', '范围', '业务'], suggestion: '先说明故障影响范围，体现排查顺序。' },
      { label: '定位高负载进程', keywords: ['top', 'htop', 'ps', '进程'], suggestion: '补充如何定位具体高负载进程。' },
      { label: '查看系统指标', keywords: ['vmstat', 'uptime', 'load', 'iostat'], suggestion: '补充系统层指标，避免只盯单个进程。' },
      { label: '结合日志和变更', keywords: ['日志', '变更', '发布', '最近'], suggestion: '增加日志和最近变更分析，回答会更完整。' },
      { label: '处理后验证', keywords: ['恢复', '验证', '回滚', '监控'], suggestion: '结尾补充验证恢复和后续监控。' }
    ],
    bonusPoints: ['预案', '容量', '限流'],
    mistakeKeywords: ['直接重启', '不用看日志']
  },
  {
    id: 2,
    category: 'linux',
    scene: '服务管理',
    question: '如果一个服务启动失败，你通常会从哪些方向排查？',
    referenceAnswer: '先看 systemctl status 和 journalctl 日志，再检查配置、端口、权限、依赖服务和环境变量，最后验证修改结果。',
    corePoints: [
      { label: '查看服务状态', keywords: ['systemctl', 'status'], suggestion: '建议先说明如何看服务状态。' },
      { label: '查看日志', keywords: ['journalctl', '日志', 'log'], suggestion: '补充日志排查，能更快定位根因。' },
      { label: '检查配置和依赖', keywords: ['配置', '依赖', '环境变量'], suggestion: '增加配置、依赖和环境变量检查。' },
      { label: '检查端口和权限', keywords: ['端口', '权限', '占用'], suggestion: '建议补充端口占用和权限问题。' }
    ],
    bonusPoints: ['回滚', '灰度'],
    mistakeKeywords: ['盲目重装']
  },
  {
    id: 3,
    category: 'linux',
    scene: '权限管理',
    question: '你会如何向新人解释 chmod 755 的含义和适用场景？',
    referenceAnswer: '755 表示属主可读写执行，组用户和其他用户可读可执行，常用于脚本、目录等需要执行和遍历的场景。',
    corePoints: [
      { label: '解释 755 的三段含义', keywords: ['属主', '组', '其他', '7', '5'], suggestion: '先拆开三段权限含义。' },
      { label: '说明读写执行', keywords: ['读', '写', '执行', 'r', 'w', 'x'], suggestion: '补充读写执行各自权限。' },
      { label: '说明使用场景', keywords: ['脚本', '目录', '场景'], suggestion: '建议加入实际使用场景。' }
    ],
    mistakeKeywords: ['所有人可写']
  },
  {
    id: 4,
    category: 'mysql',
    scene: '性能排查',
    question: 'MySQL 查询突然变慢时，你会怎么定位问题？',
    referenceAnswer: '先确认是单条 SQL 还是整体变慢，再看慢查询日志、执行计划、索引命中、锁等待和系统资源，最后做针对性优化。',
    corePoints: [
      { label: '确认范围', keywords: ['单条', '整体', '范围', '确认'], suggestion: '先区分是单条 SQL 问题还是整体性能问题。' },
      { label: '慢查询日志', keywords: ['慢查询', 'slow', '日志'], suggestion: '补充慢查询日志排查。' },
      { label: '执行计划', keywords: ['explain', '执行计划'], suggestion: '建议加上 EXPLAIN 分析。' },
      { label: '索引和锁', keywords: ['索引', '锁', '等待'], suggestion: '回答里要体现索引与锁等待分析。' },
      { label: '系统资源', keywords: ['cpu', 'io', '磁盘', '内存'], suggestion: '增加数据库之外的系统资源排查。' }
    ],
    bonusPoints: ['连接池', '缓存'],
    mistakeKeywords: ['直接加索引']
  },
  {
    id: 5,
    category: 'mysql',
    scene: '索引优化',
    question: '什么情况下你会判断一条 SQL 需要加索引？',
    referenceAnswer: '会结合慢查询、执行计划、过滤条件、排序分组和数据量判断，确认是高频且收益明显的查询再设计索引。',
    corePoints: [
      { label: '结合慢查询和执行计划', keywords: ['慢查询', '执行计划', 'explain'], suggestion: '需要结合慢查询和执行计划来判断。' },
      { label: '关注过滤排序分组字段', keywords: ['where', 'order by', 'group by', '过滤', '排序', '分组'], suggestion: '补充过滤、排序和分组字段。' },
      { label: '考虑数据量和频率', keywords: ['数据量', '频率', '高频'], suggestion: '说明数据量和查询频率的重要性。' }
    ]
  },
  {
    id: 6,
    category: 'mysql',
    scene: '事务与锁',
    question: '如果线上出现锁等待，你会怎么分析和处理？',
    referenceAnswer: '先确认阻塞链路和影响范围，再看事务、SQL 和锁等待信息，必要时终止异常会话，后续优化事务粒度和 SQL。',
    corePoints: [
      { label: '确认阻塞关系', keywords: ['阻塞', '链路', '影响'], suggestion: '先说明阻塞关系和影响范围。' },
      { label: '查看事务和锁信息', keywords: ['事务', '锁', 'show engine innodb status', 'processlist'], suggestion: '补充事务和锁等待信息查看方式。' },
      { label: '处理与优化', keywords: ['kill', '优化', '事务粒度', 'sql'], suggestion: '说明临时处理和长期优化。' }
    ]
  },
  {
    id: 7,
    category: 'behavior',
    scene: '项目表达',
    question: '请介绍一个你做过的技术项目，并重点说明你负责的部分。',
    referenceAnswer: '建议按项目背景、目标、个人职责、关键难点、解决方案、结果与复盘来回答，突出自己的贡献与影响。',
    corePoints: [
      { label: '项目背景与目标', keywords: ['背景', '目标', '项目'], suggestion: '先交代项目背景和目标。' },
      { label: '个人职责', keywords: ['负责', '职责', '我做'], suggestion: '要明确说出自己负责的部分。' },
      { label: '难点与解决方案', keywords: ['难点', '问题', '解决'], suggestion: '建议补充技术难点和解决思路。' },
      { label: '结果与复盘', keywords: ['结果', '收益', '复盘', '提升'], suggestion: '结尾加入结果和复盘会更完整。' }
    ],
    bonusPoints: ['量化', '指标']
  },
  {
    id: 8,
    category: 'behavior',
    scene: '沟通协作',
    question: '遇到需求不清晰或者和同事意见不一致时，你会怎么处理？',
    referenceAnswer: '先确认目标和事实，再沟通分歧点，必要时拉齐优先级和方案，最终记录结论并跟进执行。',
    corePoints: [
      { label: '先确认目标和事实', keywords: ['目标', '事实', '确认'], suggestion: '建议先确认目标和事实，避免空谈。' },
      { label: '沟通分歧点', keywords: ['沟通', '分歧', '对齐'], suggestion: '要体现沟通和对齐过程。' },
      { label: '形成结论并跟进', keywords: ['结论', '记录', '跟进'], suggestion: '补充结论记录和执行跟进。' }
    ]
  },
  {
    id: 9,
    category: 'linux',
    scene: '安全与规范',
    question: '你会如何避免在 Linux 生产环境中执行高风险命令时出错？',
    referenceAnswer: '会先确认环境、路径、影响范围和备份，尽量使用只读命令验证，再分步执行高风险操作，并保留回滚方案。',
    corePoints: [
      { label: '先确认环境和范围', keywords: ['环境', '路径', '范围'], suggestion: '先确认环境和影响范围。' },
      { label: '验证与备份', keywords: ['验证', '备份', '只读'], suggestion: '建议补充只读验证和备份。' },
      { label: '分步执行和回滚', keywords: ['分步', '回滚', '方案'], suggestion: '说明分步执行和回滚预案。' }
    ]
  },
  {
    id: 10,
    category: 'mysql',
    scene: '备份恢复',
    question: '你会如何设计一个基础的 MySQL 备份恢复方案？',
    referenceAnswer: '通常会明确备份目标、频率、全量与增量策略、保留周期、恢复演练和监控告警，确保备份可恢复。',
    corePoints: [
      { label: '备份策略', keywords: ['全量', '增量', '频率', '策略'], suggestion: '补充全量/增量和备份频率。' },
      { label: '保留与存储', keywords: ['保留', '存储', '异地'], suggestion: '增加保留周期和存储位置。' },
      { label: '恢复演练', keywords: ['恢复', '演练', '校验'], suggestion: '备份方案必须提到恢复演练。' }
    ]
  }
]

const sessions = new Map<string, InterviewSession>()
const reports = new Map<string, InterviewReport>()

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function pickQuestions(category: string, count: number): InterviewQuestion[] {
  const filtered = category === 'all'
    ? questionBank
    : questionBank.filter((item) => item.category === category)

  return filtered.slice(0, Math.max(1, Math.min(count, filtered.length)))
}

export function getInterviewCategories(): InterviewCategory[] {
  return categories
}

export function getInterviewQuestions(): InterviewQuestion[] {
  return questionBank
}

export function createInterviewSession(userId: number, userName: string, category: string, count: number): { sessionId: string; title: string; questions: SessionQuestion[] } {
  const pickedQuestions = pickQuestions(category, count)
  const sessionId = createId('mock_session')
  const title = `${categories.find((item) => item.key === category)?.name || '综合'}模拟面试`

  sessions.set(sessionId, {
    id: sessionId,
    userId,
    userName,
    category,
    title,
    questions: pickedQuestions,
    createdAt: new Date().toISOString()
  })

  return {
    sessionId,
    title,
    questions: pickedQuestions.map((question) => ({
      id: question.id,
      category: question.category,
      question: question.question,
      scene: question.scene
    }))
  }
}

function evaluateAnswer(question: InterviewQuestion, answer: string): AnswerEvaluation {
  const normalized = answer.trim().toLowerCase()
  const matchedPoints = question.corePoints
    .filter((point) => point.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())))
    .map((point) => point.label)
  const missingPoints = question.corePoints
    .filter((point) => !matchedPoints.includes(point.label))
    .map((point) => point.label)

  const coverageScore = Math.round((matchedPoints.length / question.corePoints.length) * 60)
  const structureSignals = ['首先', '然后', '最后', '第一', '第二', '第三', '先', '再', '最后']
  const structureScore = Math.min(20, Math.max(6, structureSignals.filter((word) => answer.includes(word)).length * 6))
  const practiceSignals = ['例如', '比如', '线上', '实际', '项目', '日志', '命令', '验证']
  const practiceScore = Math.min(15, practiceSignals.filter((word) => answer.includes(word)).length * 3)
  const riskPenalty = (question.mistakeKeywords || []).some((word) => normalized.includes(word.toLowerCase())) ? 10 : 0
  const rawScore = coverageScore + structureScore + practiceScore - riskPenalty
  const score = Math.max(0, Math.min(100, rawScore))

  const suggestions = question.corePoints
    .filter((point) => missingPoints.includes(point.label))
    .map((point) => point.suggestion)

  if (answer.trim().length < 40) {
    suggestions.unshift('回答偏短，建议按“结论-步骤-案例-结果”结构展开。')
  }

  const summary = score >= 80
    ? '回答比较完整，已经具备较好的面试表达基础。'
    : score >= 60
      ? '核心方向基本正确，但还可以补充更多细节和场景。'
      : '回答还比较薄弱，建议先补齐关键步骤，再加入实际案例。'

  return {
    questionId: question.id,
    question: question.question,
    category: question.category,
    answer,
    score,
    coverageScore,
    structureScore,
    practiceScore,
    riskPenalty,
    matchedPoints,
    missingPoints,
    suggestions: Array.from(new Set(suggestions)).slice(0, 4),
    summary
  }
}

export function submitInterviewSession(sessionId: string, userId: number, answers: SessionAnswer[]): InterviewReport | null {
  const session = sessions.get(sessionId)
  if (!session || session.userId !== userId) return null

  const evaluations = session.questions.map((question) => {
    const answer = answers.find((item) => item.questionId === question.id)?.answer || ''
    return evaluateAnswer(question, answer)
  })

  const score = Math.round(evaluations.reduce((sum, item) => sum + item.score, 0) / Math.max(1, evaluations.length))
  const strengths = Array.from(new Set(evaluations.flatMap((item) => item.matchedPoints))).slice(0, 4)
  const weaknesses = Array.from(new Set(evaluations.flatMap((item) => item.missingPoints))).slice(0, 4)
  const suggestions = Array.from(new Set(evaluations.flatMap((item) => item.suggestions))).slice(0, 6)

  const report: InterviewReport = {
    id: createId('mock_report'),
    sessionId: session.id,
    userId: session.userId,
    userName: session.userName,
    title: session.title,
    category: session.category,
    score,
    questionCount: session.questions.length,
    strengths,
    weaknesses,
    suggestions,
    answers: evaluations,
    createdAt: new Date().toISOString()
  }

  reports.set(report.id, report)
  sessions.delete(sessionId)
  return report
}

export function getInterviewSession(sessionId: string, userId: number): { sessionId: string; title: string; category: string; questions: SessionQuestion[] } | null {
  const session = sessions.get(sessionId)
  if (!session || session.userId !== userId) return null

  return {
    sessionId: session.id,
    title: session.title,
    category: session.category,
    questions: session.questions.map((question) => ({
      id: question.id,
      category: question.category,
      question: question.question,
      scene: question.scene
    }))
  }
}

export function getInterviewReport(reportId: string): InterviewReport | null {
  return reports.get(reportId) || null
}

export function getUserInterviewReports(userId: number): InterviewReport[] {
  return Array.from(reports.values())
    .filter((report) => report.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getAllInterviewReports(): InterviewReport[] {
  return Array.from(reports.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

<template>
  <div class="practice-scenario">
    <!-- Category Selection -->
    <div v-if="!currentScenario" class="category-selection">
      <h2 class="page-title">选择练习场景</h2>
      <p class="page-subtitle">选择一个场景开始实战练习，命令将在虚拟环境中真实执行</p>

      <div class="scenarios-list" v-loading="loading">
        <el-card
          v-for="scenario in scenarios"
          :key="scenario.id"
          class="scenario-card"
          shadow="hover"
          @click="startScenario(scenario)"
        >
          <div class="scenario-header">
            <div class="scenario-title">
              <span class="scenario-id">#{{ scenario.id }}</span>
              <h3>{{ scenario.title }}</h3>
            </div>
            <el-tag :type="getDifficultyType(scenario.difficulty)" size="small">
              {{ scenario.difficulty }}
            </el-tag>
          </div>
          <p class="scenario-desc">{{ scenario.description }}</p>
          <div class="scenario-meta">
            <span class="meta-item">
              <el-icon><Document /></el-icon>
              {{ scenario.taskCount }} 个任务
            </span>
            <span class="meta-item">
              <el-icon><Folder /></el-icon>
              {{ getCategoryName(scenario.category) }}
            </span>
          </div>
        </el-card>
      </div>

      <el-empty v-if="!loading && scenarios.length === 0" description="暂无练习场景" />
    </div>

    <!-- Scenario Practice -->
    <div v-else class="scenario-practice">
      <section class="practice-intro glass-panel">
        <div class="practice-copy">
          <span class="intro-eyebrow">Scenario Practice</span>
          <h2>{{ currentScenario.title }}</h2>
          <p>{{ currentScenario.description }}</p>
        </div>
        <div class="practice-intro-actions">
          <el-tag :type="getDifficultyType(currentScenario.difficulty)">
            {{ currentScenario.difficulty }}
          </el-tag>
          <el-button class="ghost-action" @click="exitScenario">返回场景列表</el-button>
        </div>
      </section>

      <el-progress
        :percentage="progressPercentage"
        :format="() => `${currentTaskIndex + 1} / ${currentScenario.tasks.length}`"
        class="task-progress"
        status="success"
      />

      <div class="practice-layout">
        <!-- Left: Task Info -->
        <div class="task-panel">
          <el-card class="task-card">
            <template #header>
              <div class="task-header">
                <span class="task-title">
                  <el-icon><Flag /></el-icon>
                  任务 {{ currentTaskIndex + 1 }} / {{ currentScenario.tasks.length }}
                </span>
                <el-button type="primary" link @click="showHint = !showHint">
                  <el-icon><QuestionFilled /></el-icon>
                  {{ showHint ? '隐藏提示' : '显示提示' }}
                </el-button>
              </div>
            </template>

            <div class="task-content">
              <div class="task-prompt">
                <el-icon class="prompt-icon"><CircleCheck /></el-icon>
                <p class="task-text">{{ currentTask?.prompt }}</p>
              </div>

              <el-alert
                v-if="showHint"
                :title="currentTask?.hint"
                type="info"
                :closable="false"
                class="task-hint"
                show-icon
              />

              <!-- Validation Result -->
              <div v-if="validationResult" class="validation-result">
                <el-alert
                  :title="validationResult.isCorrect ? '任务完成' : '请再试一次'"
                  :type="validationResult.isCorrect ? 'success' : 'error'"
                  :description="validationResult.explanation"
                  show-icon
                  :closable="false"
                  class="result-alert"
                />
                <div v-if="validationResult.isCorrect" class="next-task-action">
                  <el-button type="primary" @click="goToNextTask" :loading="loading">
                    继续下一个任务
                    <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Task List -->
          <el-card class="task-list-card">
            <template #header>
              <span class="section-title">
                <el-icon><List /></el-icon>
                场景任务列表
              </span>
            </template>
            <div class="task-list">
              <div
                v-for="(task, index) in currentScenario.tasks"
                :key="index"
                class="task-item"
                :class="{
                  'task-completed': index < currentTaskIndex,
                  'task-current': index === currentTaskIndex,
                  'task-pending': index > currentTaskIndex
                }"
              >
                <el-icon v-if="index < currentTaskIndex" class="task-status-icon completed"><CircleCheckFilled /></el-icon>
                <el-icon v-else-if="index === currentTaskIndex" class="task-status-icon current"><Loading /></el-icon>
                <el-icon v-else class="task-status-icon pending"><CircleCheck /></el-icon>
                <span class="task-number">{{ index + 1 }}.</span>
                <span class="task-name">{{ task.prompt }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- Right: Practice Terminal -->
        <div class="terminal-panel">
          <el-card class="terminal-card">
            <template #header>
              <div class="terminal-header">
                <div class="terminal-title">
                  <el-icon><Monitor /></el-icon>
                  <span>练习终端</span>
                  <el-tag size="small" type="info">虚拟环境</el-tag>
                </div>
                <div class="terminal-actions">
                  <el-button type="warning" link size="small" @click="resetTask">
                    <el-icon><RefreshRight /></el-icon>
                    重置任务
                  </el-button>
                </div>
              </div>
            </template>

            <div ref="terminalOutput" class="terminal-output">
              <div
                v-for="(line, index) in terminalLines"
                :key="index"
                class="terminal-line"
                :class="{ 'error-line': line.isError, 'command-line': line.isCommand, 'success-line': line.isSuccess }"
              >
                <span v-if="line.isCommand" class="prompt">{{ line.prompt }}</span>
                <span class="content">{{ line.content }}</span>
              </div>
            </div>

            <div class="terminal-input-line">
              <span class="prompt">{{ currentPrompt }}</span>
              <input
                ref="inputRef"
                v-model="currentCommand"
                type="text"
                class="terminal-input"
                @keydown.enter="executeCommand"
                @keydown.up.prevent="navigateHistory(-1)"
                @keydown.down.prevent="navigateHistory(1)"
                spellcheck="false"
                autocomplete="off"
                :disabled="validating"
                placeholder="输入命令..."
              />
            </div>
          </el-card>

          <!-- Quick Commands -->
          <el-card class="quick-commands-card">
            <template #header>
              <span class="section-title">
                <el-icon><MagicStick /></el-icon>
                常用命令参考
              </span>
            </template>
            <div class="quick-commands">
              <el-tag
                v-for="cmd in quickCommands"
                :key="cmd"
                class="quick-command-tag"
                @click="insertCommand(cmd)"
              >
                {{ cmd }}
              </el-tag>
            </div>
          </el-card>
        </div>
      </div>

      <!-- Completion Dialog -->
      <el-dialog
        v-model="completionVisible"
        title="场景完成"
        width="400px"
        :close-on-click-modal="false"
        :show-close="false"
        align-center
      >
        <div class="completion-content">
          <el-icon class="success-icon" :size="64" color="#67c23a"><CircleCheckFilled /></el-icon>
          <h3>恭喜完成</h3>
          <p>你已经完成了 "{{ currentScenario?.title }}" 的全部任务</p>
          <p class="completion-tip">通过实战练习，你对知识学习模块中的命令掌握会更熟练</p>
        </div>
        <template #footer>
          <el-button type="primary" size="large" @click="exitScenario">
            返回场景列表
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Folder,
  QuestionFilled,
  CircleCheckFilled,
  ArrowRight,
  Monitor,
  RefreshRight,
  Flag,
  CircleCheck,
  Loading,
  List,
  MagicStick
} from '@element-plus/icons-vue'
import {
  getScenarios,
  getScenarioDetail,
  initPractice,
  executePracticeCommand,
  validateTaskAnswer,
  nextTask,
  type Scenario,
  type Task,
} from '../../api/linux'

interface TerminalLine {
  content: string
  isError?: boolean
  isCommand?: boolean
  isSuccess?: boolean
  prompt?: string
}

interface ValidationResult {
  isCorrect: boolean
  explanation: string
  message: string
}

// Category names mapping
const categoryNames: Record<string, string> = {
  file: '文件管理',
  text: '文本处理',
  system: '系统监控',
  network: '网络工具',
  permission: '权限管理',
  package: '软件包',
  compression: '压缩归档',
  search: '搜索查找',
  shell: 'Shell脚本',
  mysql: 'MySQL学习',
}

// Quick commands for reference
const quickCommands = [
  'ls', 'ls -la', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv',
  'touch', 'cat', 'head', 'tail', 'echo', 'clear', 'help',
  'mysql -u root -p', 'SHOW DATABASES;', 'USE school;', 'SELECT * FROM students;'
]

const scenarios = ref<Scenario[]>([])
const loading = ref(false)
const validating = ref(false)
const currentScenario = ref<Scenario | null>(null)
const currentTaskIndex = ref(0)
const currentTask = ref<Task | null>(null)
const showHint = ref(false)
const sessionId = ref('')
const currentCwd = ref('/home/user')
const terminalLines = ref<TerminalLine[]>([
  { content: '欢迎来到知识学习实战练习。' },
  { content: '输入 help 查看可用命令，或使用上方常用命令快速输入。' },
  { content: '' }
])
const currentCommand = ref('')
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)
const validationResult = ref<ValidationResult | null>(null)
const completionVisible = ref(false)
const terminalOutput = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()

const currentPrompt = computed(() => {
  return `user@linux:${currentCwd.value}$`
})

const progressPercentage = computed(() => {
  if (!currentScenario.value) return 0
  return Math.round(((currentTaskIndex.value) / currentScenario.value.tasks.length) * 100)
})

onMounted(async () => {
  await fetchScenarios()
})

async function fetchScenarios() {
  loading.value = true
  try {
    const res = await getScenarios()
    scenarios.value = res.data.data
  } catch {
    ElMessage.error('获取场景列表失败')
  } finally {
    loading.value = false
  }
}

function getCategoryName(category: string): string {
  return categoryNames[category] || category
}

function getDifficultyType(difficulty: string): '' | 'success' | 'warning' | 'danger' {
  switch (difficulty) {
    case '简单':
      return 'success'
    case '中等':
      return 'warning'
    case '困难':
      return 'danger'
    default:
      return ''
  }
}

async function startScenario(scenario: Scenario) {
  loading.value = true
  try {
    // First get scenario detail with tasks
    const detailRes = await getScenarioDetail(scenario.id)
    const fullScenario = detailRes.data.data

    // Initialize practice session
    const res = await initPractice(scenario.id)
    sessionId.value = res.data.data.sessionId
    currentScenario.value = fullScenario
    currentTaskIndex.value = 0
    currentTask.value = fullScenario.tasks[0]
    currentCwd.value = res.data.data.cwd
    showHint.value = false
    validationResult.value = null
    terminalLines.value = [
      { content: `=== 场景：${fullScenario.title} ===` },
      { content: `难度：${fullScenario.difficulty} | 任务数：${fullScenario.tasks.length}` },
      { content: '' },
      { content: `【任务 1/${fullScenario.tasks.length}】${fullScenario.tasks[0].prompt}` },
      { content: '提示：' + fullScenario.tasks[0].hint },
      { content: '' }
    ]
    ElMessage.success(`场景 "${fullScenario.title}" 已开始`)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '初始化练习失败')
  } finally {
    loading.value = false
  }
}

async function executeCommand() {
  const command = currentCommand.value.trim()
  if (!command) return

  // Add to history
  commandHistory.value.push(command)
  historyIndex.value = commandHistory.value.length

  // Show command in terminal
  terminalLines.value.push({
    content: command,
    isCommand: true,
    prompt: currentPrompt.value
  })

  // Clear input
  currentCommand.value = ''

  // Special commands handled locally
  if (command === 'clear') {
    terminalLines.value = []
    scrollToBottom()
    focusInput()
    return
  }

  if (command === 'help') {
    terminalLines.value.push({
      content: `可用命令:
  ls      - 列出目录内容
  ls -la  - 列出所有文件（包含隐藏文件）
  cd      - 切换目录
  pwd     - 显示当前路径
  mkdir   - 创建目录
  rm      - 删除文件/目录
  cp      - 复制文件/目录
  mv      - 移动或重命名文件
  touch   - 创建空文件
  cat     - 查看文件内容
  head    - 查看文件开头
  tail    - 查看文件结尾
  echo    - 输出文本
  clear   - 清屏
  help    - 显示帮助`,
      isCommand: false
    })
    scrollToBottom()
    focusInput()
    return
  }

  // Execute via API
  validating.value = true
  try {
    // First execute the command
    const execRes = await executePracticeCommand(sessionId.value, command)
    const execData = execRes.data.data

    // Update current directory
    if (execData.cwd) {
      currentCwd.value = execData.cwd
    }

    // Show output
    if (execData.output && execData.output !== '__CLEAR__') {
      terminalLines.value.push({
        content: execData.output,
        isCommand: false
      })
    }

    // Show error
    if (execData.error) {
      terminalLines.value.push({
        content: execData.error,
        isError: true,
        isCommand: false
      })
    }

    // Then validate the task
    if (currentScenario.value && currentTask.value) {
      const validateRes = await validateTaskAnswer(
        currentScenario.value.id,
        currentTaskIndex.value,
        sessionId.value,
        command
      )
      const data = validateRes.data.data

      validationResult.value = {
        isCorrect: data.isCorrect,
        message: data.message,
        explanation: data.explanation
      }

      // Show validation result in terminal
      if (data.isCorrect) {
        terminalLines.value.push({
          content: `✓ ${data.message}`,
          isSuccess: true,
          isCommand: false
        })
      }
    }
  } catch (error: any) {
    terminalLines.value.push({
      content: error.response?.data?.error || '命令执行失败',
      isError: true,
      isCommand: false
    })
  } finally {
    validating.value = false
    scrollToBottom()
    focusInput()
  }
}

function insertCommand(cmd: string) {
  currentCommand.value = cmd
  focusInput()
}

function navigateHistory(direction: number) {
  if (commandHistory.value.length === 0) return

  historyIndex.value += direction

  if (historyIndex.value < 0) {
    historyIndex.value = 0
  } else if (historyIndex.value >= commandHistory.value.length) {
    historyIndex.value = commandHistory.value.length
    currentCommand.value = ''
    return
  }

  currentCommand.value = commandHistory.value[historyIndex.value]
}

async function goToNextTask() {
  loading.value = true
  try {
    const res = await nextTask(sessionId.value)
    const data = res.data.data

    if (data.completed) {
      completionVisible.value = true
    } else {
      currentTaskIndex.value++
      currentTask.value = data.task
      validationResult.value = null
      showHint.value = false
      terminalLines.value.push(
        { content: '' },
        { content: `【任务 ${currentTaskIndex.value + 1}/${currentScenario.value?.tasks.length}】${data.task.prompt}` },
        { content: '提示：' + data.task.hint },
        { content: '' }
      )
    }
  } catch {
    ElMessage.error('切换任务失败')
  } finally {
    loading.value = false
  }
}

async function resetTask() {
  // Re-initialize the practice session
  if (currentScenario.value) {
    await startScenario(currentScenario.value)
    ElMessage.success('任务已重置')
  }
}

function exitScenario() {
  currentScenario.value = null
  currentTask.value = null
  currentTaskIndex.value = 0
  sessionId.value = ''
  terminalLines.value = [
    { content: '欢迎来到知识学习实战练习。' },
    { content: '输入 help 查看可用命令，或使用上方常用命令快速输入。' },
    { content: '' }
  ]
  validationResult.value = null
  completionVisible.value = false
}

function scrollToBottom() {
  nextTick(() => {
    if (terminalOutput.value) {
      terminalOutput.value.scrollTop = terminalOutput.value.scrollHeight
    }
  })
}

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}
</script>

<style scoped>
.practice-scenario {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: transparent;
}

.glass-panel {
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.56));
  box-shadow:
    0 24px 48px rgba(20, 52, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.practice-intro {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 0 0 8px;
  border-radius: 0;
  margin-bottom: 18px;
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.intro-eyebrow {
  display: none;
}

.practice-copy h2 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #0f172a;
}

.practice-copy p {
  margin: 0;
  max-width: 640px;
  color: #52607a;
  line-height: 1.7;
}

.practice-intro-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ghost-action {
  border-radius: 999px;
}

.page-title {
  font-size: 24px;
  color: #1f2329;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #646a73;
  font-size: 14px;
  margin-bottom: 24px;
}

.scenarios-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.scenario-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 20px 38px rgba(148, 163, 184, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.scenario-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #3370ff;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.scenario-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.scenario-id {
  font-size: 14px;
  color: #3370ff;
  font-weight: 600;
}

.scenario-title h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2329;
}

.scenario-desc {
  color: #646a73;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.6;
}

.scenario-meta {
  display: flex;
  gap: 16px;
  color: #8f959e;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Scenario Practice Styles */
.scenario-practice {
  padding: 0;
}

.task-progress {
  margin: 20px 0;
}

/* Two-column layout */
.practice-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 1024px) {
  .practice-layout {
    grid-template-columns: 1fr;
  }
}

/* Task Panel */
.task-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.56));
  box-shadow:
    0 24px 48px rgba(20, 52, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.task-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e5e7;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #3370ff;
}

.task-content {
  padding: 8px 0;
}

.task-prompt {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 16px;
  background: #f0f7ff;
  border-radius: 8px;
  border-left: 4px solid #3370ff;
}

.prompt-icon {
  font-size: 20px;
  color: #3370ff;
  flex-shrink: 0;
  margin-top: 2px;
}

.task-text {
  font-size: 15px;
  color: #1f2329;
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
}

.task-hint {
  margin-top: 12px;
}

/* Task List */
.task-list-card {
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.56));
  box-shadow:
    0 24px 48px rgba(20, 52, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.task-list-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e5e7;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2329;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.task-completed {
  background: #f0f9eb;
  color: #67c23a;
}

.task-current {
  background: #ecf5ff;
  color: #3370ff;
  font-weight: 500;
  border: 1px solid #d0e0ff;
}

.task-pending {
  background: #f5f7fa;
  color: #909399;
}

.task-status-icon {
  font-size: 16px;
}

.task-status-icon.completed {
  color: #67c23a;
}

.task-status-icon.current {
  color: #3370ff;
}

.task-status-icon.pending {
  color: #c0c4cc;
}

.task-number {
  font-weight: 600;
  min-width: 24px;
}

.task-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Validation Result */
.validation-result {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e5e7;
}

.result-alert {
  margin-bottom: 12px;
}

.next-task-action {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

/* Terminal Panel */
.terminal-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.terminal-card {
  background: #1e1e1e;
  border: none;
  flex: 1;
}

.terminal-card :deep(.el-card__header) {
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  padding: 12px 16px;
}

.terminal-card :deep(.el-card__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.terminal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 500;
}

.terminal-actions {
  display: flex;
  gap: 8px;
}

.terminal-output {
  height: 300px;
  overflow-y: auto;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
  background: #1e1e1e;
}

.terminal-line {
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 2px;
}

.error-line {
  color: #f44747;
}

.success-line {
  color: #7ee787;
}

.command-line {
  display: flex;
  gap: 8px;
}

.prompt {
  color: #4ec9b0;
  flex-shrink: 0;
}

.content {
  color: #d4d4d4;
}

.terminal-input-line {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #2d2d2d;
  border-top: 1px solid #3d3d3d;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #d4d4d4;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  margin: 0 0 0 8px;
}

.terminal-input::placeholder {
  color: #6e6e6e;
}

.terminal-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Quick Commands */
.quick-commands-card {
  background: #fff;
}

.quick-commands-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e5e7;
  padding: 12px 16px;
}

.quick-commands {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-command-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-command-tag:hover {
  background: #3370ff;
  color: white;
}

/* Scrollbar styling */
.terminal-output::-webkit-scrollbar {
  width: 8px;
}

.terminal-output::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.terminal-output::-webkit-scrollbar-thumb {
  background: #3d3d3d;
  border-radius: 4px;
}

.terminal-output::-webkit-scrollbar-thumb:hover {
  background: #4d4d4d;
}

/* Completion Dialog */
.completion-content {
  text-align: center;
  padding: 20px;
}

.success-icon {
  margin-bottom: 16px;
}

.completion-content h3 {
  font-size: 20px;
  color: #1f2329;
  margin-bottom: 8px;
}

.completion-content p {
  color: #646a73;
  margin-bottom: 8px;
}

.completion-tip {
  font-size: 13px;
  color: #8f959e;
  margin-top: 12px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .practice-scenario {
    padding: 12px;
  }

  .scenarios-list {
    grid-template-columns: 1fr;
  }

  .terminal-output {
    height: 200px;
    font-size: 13px;
  }

  .terminal-input-line {
    font-size: 13px;
  }

  .task-prompt {
    padding: 12px;
  }

  .task-text {
    font-size: 14px;
  }
}
</style>


<template>
  <div class="command-learn">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">命令知识学习</h2>
      <p class="page-subtitle">共 {{ totalCommands }} 个常用命令，选择分类开始学习</p>
    </div>

    <!-- 搜索栏 -->
    <el-input
      v-model="searchQuery"
      placeholder="搜索命令名称或功能..."
      clearable
      class="search-input"
      size="large"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <!-- 分类选择 -->
    <div class="category-panel">
      <div class="category-toolbar">
        <div class="category-toolbar-text">
          <span class="toolbar-label">学习分类</span>
          <p class="toolbar-hint">支持下拉选择，也可以直接点击分类模块切换</p>
        </div>
        <el-select
          v-model="activeCategory"
          class="category-select"
          size="large"
          placeholder="请选择学习分类"
        >
          <el-option
            v-for="cat in categories"
            :key="cat.key"
            :label="cat.name"
            :value="cat.key"
          >
            <div class="category-option">
              <span class="category-option-icon">{{ cat.icon }}</span>
              <span class="category-option-name">{{ cat.name }}</span>
              <span class="category-option-count">{{ getCategoryCommandCount(cat.key) }} 条</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <div class="category-grid">
        <button
          v-for="cat in categories"
          :key="cat.key"
          type="button"
          class="category-tile"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          <span class="category-tile-icon">{{ cat.icon }}</span>
          <span class="category-tile-content">
            <span class="category-tile-name">{{ cat.name }}</span>
            <span class="category-tile-meta">{{ getCategoryCommandCount(cat.key) }} 个命令</span>
          </span>
        </button>
      </div>
    </div>

    <!-- 命令卡片网格 -->
    <div class="commands-grid" v-loading="loading">
      <el-card
        v-for="cmd in filteredCommands"
        :key="cmd.name"
        class="command-card"
        shadow="hover"
        @click="showCommandDetail(cmd)"
      >
        <div class="command-header">
          <div class="command-title">
            <code class="command-name">{{ cmd.name }}</code>
            <el-tag size="small" type="primary" effect="light">{{ getCategoryName(cmd.category) }}</el-tag>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
        <p class="command-desc">{{ cmd.description }}</p>
        <div class="command-syntax">
          <code>{{ cmd.syntax }}</code>
        </div>
        <div class="command-footer" v-if="cmd.examples?.length">
          <span class="example-count">{{ cmd.examples.length }} 个示例</span>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && filteredCommands.length === 0" description="没有找到匹配的命令" />

    <!-- 命令详情抽屉 -->
    <el-drawer
      v-model="detailVisible"
      :title="selectedCommand?.name + ' - 命令详解'"
      size="60%"
      :destroy-on-close="true"
      class="command-detail-drawer"
    >
      <div v-if="selectedCommand" class="command-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="detail-header">
            <code class="detail-name">{{ selectedCommand.name }}</code>
            <el-tag type="primary" size="small">{{ getCategoryName(selectedCommand.category) }}</el-tag>
          </div>
          <p class="detail-short-desc">{{ selectedCommand.description }}</p>
        </div>

        <!-- 详细描述 -->
        <div class="detail-section" v-if="selectedCommand.longDesc">
          <h4 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            命令详解
          </h4>
          <div class="detail-long-desc">{{ selectedCommand.longDesc }}</div>
        </div>

        <!-- 语法格式 -->
        <div class="detail-section">
          <h4 class="section-title">
            <el-icon><Document /></el-icon>
            语法格式
          </h4>
          <pre class="syntax-block"><code>{{ selectedCommand.syntax }}</code></pre>
        </div>

        <!-- 常用选项 -->
        <div class="detail-section" v-if="selectedCommand.options?.length">
          <h4 class="section-title">
            <el-icon><Setting /></el-icon>
            常用选项
          </h4>
          <div class="options-list">
            <div
              v-for="(opt, idx) in selectedCommand.options"
              :key="idx"
              class="option-item"
            >
              <code class="option-flag">{{ opt.option }}</code>
              <span class="option-desc">{{ opt.description }}</span>
            </div>
          </div>
        </div>

        <!-- 使用示例 -->
        <div class="detail-section" v-if="selectedCommand.examples?.length">
          <h4 class="section-title">
            <el-icon><Collection /></el-icon>
            使用示例
          </h4>
          <div class="examples-list">
            <div
              v-for="(example, idx) in selectedCommand.examples"
              :key="idx"
              class="example-item"
            >
              <div class="example-header">
                <span class="example-number">示例 {{ idx + 1 }}</span>
              </div>
              <pre class="example-code"><code>{{ example.cmd }}</code></pre>
              <p class="example-desc">{{ example.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 使用场景 -->
        <div class="detail-section" v-if="selectedCommand.usageScenarios?.length">
          <h4 class="section-title">
            <el-icon><Suitcase /></el-icon>
            适用场景
          </h4>
          <ul class="scenarios-list">
            <li v-for="(scenario, idx) in selectedCommand.usageScenarios" :key="idx">
              {{ scenario }}
            </li>
          </ul>
        </div>

        <!-- 相关命令 -->
        <div class="detail-section" v-if="selectedCommand.related?.length">
          <h4 class="section-title">
            <el-icon><Connection /></el-icon>
            相关命令
          </h4>
          <div class="related-commands">
            <el-tag
              v-for="cmd in selectedCommand.related"
              :key="cmd"
              type="info"
              class="related-tag"
              @click="searchRelatedCommand(cmd)"
            >
              {{ cmd }}
            </el-tag>
          </div>
        </div>

        <!-- 实用技巧 -->
        <div class="detail-section" v-if="selectedCommand.tips">
          <h4 class="section-title">
            <el-icon><StarFilled /></el-icon>
            实用技巧
          </h4>
          <el-alert
            :title="selectedCommand.tips"
            type="success"
            :closable="false"
            show-icon
          />
        </div>

        <!-- 注意事项 -->
        <div class="detail-section" v-if="selectedCommand.note">
          <h4 class="section-title">
            <el-icon><WarningFilled /></el-icon>
            注意事项
          </h4>
          <el-alert
            :title="selectedCommand.note"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button type="primary" @click="openInTerminal(selectedCommand.name)">
            <el-icon><Monitor /></el-icon>
            在虚拟终端中练习
          </el-button>
          <el-button @click="detailVisible = false">
            关闭
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  ArrowRight,
  InfoFilled,
  Document,
  Setting,
  Collection,
  Suitcase,
  Connection,
  StarFilled,
  WarningFilled,
  Monitor
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getCategories,
  getCommandsByCategory,
  searchCommands,
  getCommandDetail,
  getLinuxStats,
  type Category,
  type Command,
} from '../../api/linux'

const router = useRouter()

const categories = ref<Category[]>([])
const commands = ref<Command[]>([])
const allCommands = ref<Command[]>([])
const activeCategory = ref('')
const searchQuery = ref('')
const loading = ref(false)
const detailVisible = ref(false)
const selectedCommand = ref<Command | null>(null)
const totalCommands = ref(0)

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
}

categoryNames.mysql = 'MySQL学习'

function getCategoryCommandCount(category: string): number {
  return allCommands.value.filter(cmd => cmd.category === category).length
}

function getCategoryName(category: string): string {
  return categoryNames[category] || category
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchAllCommands(), fetchStats()])
})

async function fetchCategories() {
  try {
    const res = await getCategories()
    categories.value = res.data.data
    if (categories.value.length > 0 && !activeCategory.value) {
      activeCategory.value = categories.value[0].key
    }
  } catch {
    ElMessage.error('获取分类失败')
  }
}

async function fetchAllCommands() {
  try {
    const categories = ['file', 'text', 'system', 'network', 'permission', 'package', 'compression', 'search', 'shell', 'mysql']
    const allCmds: Command[] = []
    for (const cat of categories) {
      const res = await getCommandsByCategory(cat)
      allCmds.push(...res.data.data)
    }
    allCommands.value = allCmds
  } catch {
    // Silent fail
  }
}

async function fetchStats() {
  try {
    const res = await getLinuxStats()
    totalCommands.value = res.data.data.commands
  } catch {
    // Silent fail
  }
}

watch(activeCategory, async (newCategory) => {
  if (!newCategory) return
  loading.value = true
  try {
    const res = await getCommandsByCategory(newCategory)
    commands.value = res.data.data
  } catch {
    ElMessage.error('获取命令列表失败')
  } finally {
    loading.value = false
  }
})

const filteredCommands = computed(() => {
  if (!searchQuery.value) return commands.value
  const query = searchQuery.value.toLowerCase()
  return commands.value.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query)
  )
})

let searchTimeout: NodeJS.Timeout | null = null
watch(searchQuery, (newQuery) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!newQuery || newQuery.length < 2) return

  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      const res = await searchCommands(newQuery)
      commands.value = res.data.data
    } catch {
      // Silent fail
    } finally {
      loading.value = false
    }
  }, 300)
})

async function showCommandDetail(cmd: Command) {
  loading.value = true
  try {
    const res = await getCommandDetail(cmd.name)
    selectedCommand.value = res.data.data
    detailVisible.value = true
  } catch {
    selectedCommand.value = cmd
    detailVisible.value = true
  } finally {
    loading.value = false
  }
}

function searchRelatedCommand(cmdName: string) {
  detailVisible.value = false
  searchQuery.value = cmdName
}

function openInTerminal(commandName: string) {
  detailVisible.value = false
  localStorage.setItem('terminalCommand', commandName)
  router.push('/learning/practice')
}
</script>

<style scoped>
.command-learn {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: transparent;
}

.page-header {
  margin-bottom: 24px;
  border-radius: 0;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.page-title {
  font-size: 24px;
  color: #1f2329;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #646a73;
  font-size: 14px;
  margin: 0;
}

.search-input {
  margin-bottom: 20px;
  max-width: 500px;
}

.category-panel {
  margin-bottom: 24px;
  padding: 22px;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 20px 38px rgba(148, 163, 184, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.category-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 18px;
}

.category-toolbar-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar-label {
  font-size: 15px;
  font-weight: 700;
  color: #1f2a44;
}

.toolbar-hint {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.category-select {
  width: 320px;
  max-width: 100%;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.category-option-icon {
  font-size: 18px;
}

.category-option-name {
  flex: 1;
  color: #1f2937;
}

.category-option-count {
  font-size: 12px;
  color: #6b7280;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.category-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d7e3f7;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  text-align: left;
}

.category-tile:hover {
  transform: translateY(-2px);
  border-color: #8bb3ff;
  box-shadow: 0 10px 24px rgba(51, 112, 255, 0.12);
}

.category-tile.active {
  border-color: #3370ff;
  background: linear-gradient(135deg, #eef4ff 0%, #ffffff 100%);
  box-shadow: 0 12px 28px rgba(51, 112, 255, 0.16);
}

.category-tile-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #ebf2ff 0%, #f8fbff 100%);
  font-size: 22px;
  flex-shrink: 0;
}

.category-tile.active .category-tile-icon {
  background: linear-gradient(135deg, #3370ff 0%, #5b8cff 100%);
  color: #fff;
}

.category-tile-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.category-tile-name {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.category-tile-meta {
  font-size: 12px;
  color: #6b7280;
}

/* 命令卡片网格 */
.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.command-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.56));
  box-shadow:
    0 24px 48px rgba(20, 52, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.command-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #3370ff;
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.command-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.command-name {
  font-size: 20px;
  font-weight: bold;
  color: #3370ff;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #d0e0ff;
}

.arrow-icon {
  color: #c0c4cc;
  transition: color 0.2s;
}

.command-card:hover .arrow-icon {
  color: #3370ff;
}

.command-desc {
  color: #4a4a4a;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.6;
}

.command-syntax {
  background: #f8f9fa;
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 3px solid #3370ff;
}

.command-syntax code {
  font-size: 13px;
  color: #1f2329;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.command-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.example-count {
  font-size: 12px;
  color: #8f959e;
}

/* 详情抽屉样式 */
.command-detail {
  padding: 10px 20px 30px;
}

.detail-section {
  margin-bottom: 28px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-name {
  font-size: 24px;
  font-weight: bold;
  color: #3370ff;
  background: #f0f4ff;
  padding: 8px 16px;
  border-radius: 8px;
}

.detail-short-desc {
  font-size: 16px;
  color: #4a4a4a;
  line-height: 1.6;
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #1f2329;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e5e7;
}

.section-title .el-icon {
  color: #3370ff;
}

.detail-long-desc {
  font-size: 15px;
  color: #4a4a4a;
  line-height: 1.8;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.syntax-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  margin: 0;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #3370ff;
}

.option-flag {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #3370ff;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 80px;
}

.option-desc {
  font-size: 14px;
  color: #4a4a4a;
  line-height: 1.5;
}

/* 示例列表 */
.examples-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.example-item {
  border: 1px solid #e4e5e7;
  border-radius: 8px;
  overflow: hidden;
}

.example-header {
  background: #f0f4ff;
  padding: 10px 16px;
  border-bottom: 1px solid #d0e0ff;
}

.example-number {
  font-size: 13px;
  color: #3370ff;
  font-weight: 600;
}

.example-code {
  background: #1e1e1e;
  color: #4ec9b0;
  padding: 16px;
  margin: 0;
  font-size: 14px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.example-desc {
  padding: 12px 16px;
  font-size: 14px;
  color: #4a4a4a;
  background: #f8f9fa;
  margin: 0;
  border-top: 1px solid #e4e5e7;
}

/* 使用场景 */
.scenarios-list {
  background: #f8f9fa;
  padding: 16px 20px;
  border-radius: 8px;
  margin: 0;
}

.scenarios-list li {
  font-size: 14px;
  color: #4a4a4a;
  line-height: 1.8;
  margin-bottom: 8px;
  padding-left: 8px;
}

.scenarios-list li:last-child {
  margin-bottom: 0;
}

.scenarios-list li::marker {
  color: #3370ff;
}

/* 相关命令 */
.related-commands {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.related-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.related-tag:hover {
  background: #3370ff;
  color: white;
}

/* 操作按钮 */
.detail-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 2px solid #e4e5e7;
  margin-top: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .command-learn {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .category-panel {
    padding: 16px;
  }

  .category-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .category-select {
    width: 100%;
  }

  .category-grid {
    grid-template-columns: 1fr 1fr;
  }

  .commands-grid {
    grid-template-columns: 1fr;
  }

  .command-name {
    font-size: 18px;
  }

  .command-detail-drawer :deep(.el-drawer) {
    width: 100% !important;
  }

  .detail-name {
    font-size: 20px;
  }

  .option-item {
    flex-direction: column;
    gap: 8px;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>


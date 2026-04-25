<template>
  <div class="video-resources">
    <section class="page-intro glass-panel">
      <div class="intro-copy">
        <h2>视频资源</h2>
        <p>在同一个工作台里筛选、切换和内嵌观看课程视频，不再跳出到新的页面处理。</p>
      </div>
    </section>

    <section class="toolbar glass-panel">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索视频标题、描述或标签"
        clearable
        class="search-box"
      />
      <el-select v-model="activeCategory" class="category-select">
        <el-option label="全部分类" value="all" />
        <el-option
          v-for="category in categories"
          :key="category"
          :label="category"
          :value="category"
        />
      </el-select>
    </section>

    <el-empty v-if="filteredVideos.length === 0" description="暂无匹配的视频资源" />

    <section v-else class="workspace">
      <el-card v-if="currentVideo" class="player-panel" shadow="never">
        <div class="screen-frame">
          <div class="screen-topbar">
            <div class="screen-lights">
              <span class="light light-red"></span>
              <span class="light light-yellow"></span>
              <span class="light light-green"></span>
            </div>
            <div class="screen-badge">
              <span class="badge-dot"></span>
              <span>高清播放</span>
            </div>
          </div>

          <div class="player-shell">
            <iframe
              v-if="isIframeVideo(currentVideo.embed_url)"
              :src="getPlayerUrl(currentVideo.embed_url)"
              allowfullscreen
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
            />
            <video
              v-else
              :src="currentVideo.embed_url"
              controls
              preload="metadata"
              playsinline
            />
          </div>
        </div>

        <div class="player-content">
          <div class="title-row">
            <div class="title-block">
              <h2>{{ currentVideo.title }}</h2>
              <p>{{ currentVideo.description || '暂无简介' }}</p>
            </div>
            <el-tag type="success" effect="plain">{{ currentVideo.category }}</el-tag>
          </div>

          <div class="meta-row">
            <span>来源: {{ currentVideo.source_name || '第三方视频源' }}</span>
            <span>时长: {{ currentVideo.duration_text || '未填写' }}</span>
          </div>

          <div v-if="getTagList(currentVideo.tags).length" class="tag-row">
            <el-tag
              v-for="tag in getTagList(currentVideo.tags)"
              :key="tag"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <aside class="playlist-panel">
        <div class="playlist-head">
          <div>
            <h3>视频列表</h3>
            <p>点击右侧卡片即可切换当前播放内容</p>
          </div>
          <el-button
            v-if="currentVideo"
            type="primary"
            plain
            size="small"
            @click="openVideo(currentVideo.embed_url)"
          >
            新窗口打开
          </el-button>
        </div>

        <div class="playlist-scroll">
          <button
            v-for="video in filteredVideos"
            :key="video.id"
            type="button"
            class="video-item"
            :class="{ active: currentVideo?.id === video.id }"
            @click="selectVideo(video)"
          >
            <div class="video-item-top">
              <span class="video-item-category">{{ video.category }}</span>
              <span class="video-item-duration">{{ video.duration_text || '未填写' }}</span>
            </div>
            <h4>{{ video.title }}</h4>
            <p>{{ video.description || '暂无简介' }}</p>
            <div v-if="getTagList(video.tags).length" class="video-item-tags">
              <span
                v-for="tag in getTagList(video.tags).slice(0, 3)"
                :key="tag"
                class="mini-tag"
              >
                {{ tag }}
              </span>
            </div>
          </button>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getVideoResources } from '../api/videoResources'

interface VideoResource {
  id: number
  title: string
  category: string
  description?: string | null
  embed_url: string
  source_name?: string | null
  duration_text?: string | null
  tags?: string | string[] | null
}

const searchKeyword = ref('')
const activeCategory = ref('all')
const videos = ref<VideoResource[]>([])
const selectedVideoId = ref<number | null>(null)

const categories = computed(() =>
  [...new Set(videos.value.map((item) => item.category).filter(Boolean))],
)

const filteredVideos = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return videos.value.filter((video) => {
    const categoryMatched = activeCategory.value === 'all' || video.category === activeCategory.value
    const keywordMatched =
      !keyword ||
      String(video.title || '').toLowerCase().includes(keyword) ||
      String(video.description || '').toLowerCase().includes(keyword) ||
      getTagList(video.tags).some((tag) => tag.toLowerCase().includes(keyword))

    return categoryMatched && keywordMatched
  })
})

const currentVideo = computed(() => {
  return filteredVideos.value.find((video) => video.id === selectedVideoId.value) || filteredVideos.value[0] || null
})

watch(
  filteredVideos,
  (list) => {
    if (!list.length) {
      selectedVideoId.value = null
      return
    }

    if (!list.some((video) => video.id === selectedVideoId.value)) {
      selectedVideoId.value = list[0].id
    }
  },
  { immediate: true },
)

function getTagList(tags: string | string[] | null | undefined) {
  if (Array.isArray(tags)) return tags

  return String(tags || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function isIframeVideo(url: string) {
  return /player\.bilibili\.com/i.test(String(url || ''))
}

function getPlayerUrl(url: string) {
  const text = String(url || '').trim()
  if (!text) return text

  try {
    const parsed = new URL(text)
    parsed.searchParams.set('autoplay', '0')
    return parsed.toString()
  } catch {
    return text
  }
}

function selectVideo(video: VideoResource) {
  selectedVideoId.value = video.id
}

async function loadVideos() {
  try {
    const response = await getVideoResources()
    videos.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Load videos error:', error)
    ElMessage.error('加载视频资源失败')
  }
}

function openVideo(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  loadVideos()
})
</script>

<style scoped>
.video-resources {
  min-height: 100%;
  padding: 24px;
  background: transparent;
}

.glass-panel {
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 20px 38px rgba(148, 163, 184, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
}

.page-intro {
  padding: 0 0 4px;
  border-radius: 0;
  margin-bottom: 18px;
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.intro-copy h2 {
  margin: 0 0 6px;
  font-size: 24px;
  line-height: 1.15;
  color: #0f172a;
}

.intro-copy p {
  margin: 0;
  max-width: 640px;
  color: #52607a;
  font-size: 13px;
  line-height: 1.65;
}

.toolbar {
  margin: 8px 0 16px;
  display: flex;
  gap: 14px;
  align-items: center;
  border-radius: 28px;
  padding: 14px;
}

.search-box {
  max-width: 340px;
}

.category-select {
  width: 180px;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.52fr) 280px;
  gap: 18px;
  align-items: stretch;
  min-height: calc(100vh - 260px);
}

.player-panel,
.playlist-panel {
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 38px rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(20px);
}

.player-panel {
  overflow: hidden;
}

.screen-frame {
  padding: 14px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(241, 245, 249, 0.92)),
    radial-gradient(circle at top left, rgba(191, 219, 254, 0.22), transparent 36%);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 16px 34px rgba(148, 163, 184, 0.12);
}

.screen-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 0 6px;
}

.screen-lights {
  display: flex;
  gap: 8px;
}

.light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.light-red { background: #ff6b6b; }
.light-yellow { background: #ffd166; }
.light-green { background: #42d392; }

.screen-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  color: #54637d;
  font-size: 12px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.4);
}

.player-shell {
  overflow: hidden;
  border-radius: 26px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.1), transparent 35%),
    linear-gradient(160deg, #111827 0%, #172554 100%);
  min-height: 500px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 18px 30px rgba(15, 23, 42, 0.16);
}

.player-shell iframe,
.player-shell video {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
  display: block;
}

.player-content {
  padding: 22px 24px 24px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.title-block h2 {
  margin: 0;
  font-size: 15px;
  color: #0f172a;
}

.title-block p {
  margin: 8px 0 0;
  color: #52607a;
  line-height: 1.7;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 18px;
  color: #64748b;
  font-size: 14px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.playlist-panel {
  padding: 16px 16px 10px;
}

.playlist-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.playlist-head h3 {
  margin: 0;
  font-size: 15px;
  color: #0f172a;
}

.playlist-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.playlist-scroll {
  max-height: calc(100vh - 330px);
  overflow: auto;
  padding-right: 6px;
}

.video-item {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.68);
  border-radius: 24px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.video-item:hover,
.video-item.active {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 14px 24px rgba(148, 163, 184, 0.16);
}

.video-item-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #64748b;
  font-size: 13px;
}

.video-item h4 {
  margin: 0;
  font-size: 14px;
  color: #0f172a;
}

.video-item p {
  margin: 8px 0 0;
  color: #52607a;
  line-height: 1.55;
  font-size: 13px;
}

.video-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.mini-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .playlist-scroll {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .video-resources {
    padding: 16px;
  }

  .page-intro {
    padding: 0;
  }

  .intro-copy h2 {
    font-size: 20px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box,
  .category-select {
    max-width: none;
    width: 100%;
  }

  .player-shell,
  .player-shell iframe,
  .player-shell video {
    min-height: 300px;
  }

  .title-row,
  .playlist-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>


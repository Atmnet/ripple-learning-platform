<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已经被移动。</p>
      <el-button type="primary" @click="router.push('/')">返回平台首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: #fff;
}

.content h1 {
  margin: 0;
  font-size: 120px;
  font-weight: 800;
}

.content h2 {
  margin: 0 0 16px;
  font-size: 32px;
}

.content p {
  margin-bottom: 32px;
  font-size: 18px;
}
</style>

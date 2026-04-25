<template>
  <div class="system-settings">
    <section class="module-heading">
      <div>
        <h1>系统设置</h1>
        <p>统一管理注册开关、上传限制、百度 BOS 存储和限流配置，保存后会立即生效。</p>
      </div>
      <div class="heading-actions">
        <el-button @click="goBack">返回管理后台</el-button>
      </div>
    </section>

    <section class="info-grid">
      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>系统信息</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="系统名称">ripple-learning-platform</el-descriptions-item>
          <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
          <el-descriptions-item label="部署环境">生产环境</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>当前管理员</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ authStore.user?.real_name || "-" }}</el-descriptions-item>
          <el-descriptions-item label="账号">{{ authStore.user?.username || "-" }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag type="danger">管理员</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </section>

    <el-card class="settings-card" shadow="never" v-loading="saving">
      <template #header>
        <div class="card-header">
          <span>基础配置</span>
        </div>
      </template>

      <el-form label-width="180px">
        <el-form-item label="允许学员注册">
          <el-switch v-model="settings.allowRegistration" />
          <span class="form-tip">关闭后，登录页不再显示注册入口，注册接口也会被后端拦截。</span>
        </el-form-item>
        <el-form-item label="日报提交提醒">
          <el-switch v-model="settings.dailyReportReminder" />
        </el-form-item>
        <el-form-item label="作业截止提醒">
          <el-switch v-model="settings.assignmentReminder" />
        </el-form-item>
        <el-form-item label="文件上传限制 (MB)">
          <el-input-number v-model="settings.maxFileSize" :min="1" :max="100" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card" shadow="never" v-loading="saving">
      <template #header>
        <div class="card-header">
          <span>百度 BOS 存储</span>
          <el-tag :type="settings.bosEnabled ? 'success' : 'info'">
            {{ settings.bosEnabled ? "已启用" : "未启用" }}
          </el-tag>
        </div>
      </template>

      <el-form label-width="180px">
        <el-form-item label="启用 BOS">
          <el-switch v-model="settings.bosEnabled" />
          <span class="form-tip">关闭时，作业和附件会回退到本地 `/uploads` 存储。</span>
        </el-form-item>
        <el-form-item label="访问域名">
          <el-input v-model="settings.bosDomain" placeholder="例如：bj.bcebos.com 或你的自定义域名" />
        </el-form-item>
        <el-form-item label="Bucket 名称">
          <el-input v-model="settings.bosBucket" placeholder="例如：abc-atmnet" />
        </el-form-item>
        <el-form-item label="Access Key (AK)">
          <el-input v-model="settings.bosAccessKey" placeholder="请输入 BOS Access Key" />
        </el-form-item>
        <el-form-item label="Secret Key (SK)">
          <el-input v-model="settings.bosSecretKey" type="password" show-password placeholder="请输入 BOS Secret Key" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card" shadow="never" v-loading="rateLimitLoading">
      <template #header>
        <div class="card-header">
          <span>限流设置</span>
          <el-tag type="warning">全局生效</el-tag>
        </div>
      </template>

      <el-form label-width="180px">
        <el-form-item label="启用限流">
          <el-switch v-model="rateLimitConfig.enabled" />
        </el-form-item>
        <el-form-item label="每分钟请求上限">
          <el-select v-model="rateLimitConfig.max" style="width: 240px">
            <el-option
              v-for="option in rateLimitOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <span class="form-tip">建议生产环境使用 1000 次 / 分钟，兼顾保护和可用性。</span>
        </el-form-item>
        <el-form-item label="时间窗口">
          <el-input-number v-model="rateLimitConfig.windowMinutes" :min="1" :max="60" />
          <span class="form-tip">分钟</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="rateLimitLoading" @click="saveRateLimitConfig">保存限流配置</el-button>
          <el-button :loading="rateLimitLoading" @click="resetRateLimitConfig">重置为默认值</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="form-actions">
      <el-button type="primary" :loading="saving" @click="saveSettings">保存系统设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import api from "../api";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const saving = ref(false);
const rateLimitLoading = ref(false);

const settings = ref({
  allowRegistration: false,
  dailyReportReminder: true,
  assignmentReminder: true,
  maxFileSize: 10,
  bosEnabled: false,
  bosDomain: "",
  bosBucket: "",
  bosAccessKey: "",
  bosSecretKey: "",
});

const rateLimitConfig = ref({
  max: 1000,
  windowMinutes: 1,
  enabled: true,
});

const rateLimitOptions = [
  { label: "100 次 / 分钟", value: 100 },
  { label: "200 次 / 分钟", value: 200 },
  { label: "500 次 / 分钟", value: 500 },
  { label: "1000 次 / 分钟", value: 1000 },
];

const goBack = () => {
  router.push("/admin");
};

const loadSettings = async () => {
  saving.value = true;
  try {
    const response = await api.get("/app-settings");
    settings.value = response.data.data;
  } catch {
    ElMessage.error("加载系统设置失败");
  } finally {
    saving.value = false;
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    const response = await api.put("/app-settings", settings.value);
    settings.value = response.data.data;
    ElMessage.success("系统设置已保存");
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || "保存系统设置失败");
  } finally {
    saving.value = false;
  }
};

const loadRateLimitConfig = async () => {
  rateLimitLoading.value = true;
  try {
    const response = await api.get("/rate-limit");
    rateLimitConfig.value = {
      max: response.data.max,
      windowMinutes: response.data.windowMinutes,
      enabled: response.data.enabled,
    };
  } catch {
    ElMessage.error("加载限流配置失败");
  } finally {
    rateLimitLoading.value = false;
  }
};

const saveRateLimitConfig = async () => {
  rateLimitLoading.value = true;
  try {
    await api.put("/rate-limit", {
      max: rateLimitConfig.value.max,
      windowMinutes: rateLimitConfig.value.windowMinutes,
      enabled: rateLimitConfig.value.enabled,
    });
    ElMessage.success("限流配置已保存并生效");
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || "保存限流配置失败");
  } finally {
    rateLimitLoading.value = false;
  }
};

const resetRateLimitConfig = async () => {
  rateLimitLoading.value = true;
  try {
    const response = await api.post("/rate-limit/reset");
    rateLimitConfig.value = {
      max: response.data.config.max,
      windowMinutes: response.data.config.windowMinutes,
      enabled: response.data.config.enabled,
    };
    ElMessage.success("限流配置已重置为默认值");
  } catch {
    ElMessage.error("重置限流配置失败");
  } finally {
    rateLimitLoading.value = false;
  }
};

onMounted(() => {
  loadRateLimitConfig();
  loadSettings();
});
</script>

<style scoped>
.system-settings {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.settings-card {
  border-radius: 30px;
  border: 1px solid rgba(235, 240, 248, 0.92);
  background: #fff;
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 700;
  color: #22324c;
}

.form-tip {
  margin-left: 10px;
  color: #7d85a2;
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .module-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

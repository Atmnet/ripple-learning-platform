<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1>ripple-learning-platform</h1>
        <p>注册新账号</p>
      </div>

      <el-alert
        v-if="registrationDisabled"
        title="当前已关闭学员注册，请联系管理员开通账号"
        type="warning"
        :closable="false"
        show-icon
        class="disabled-alert"
      />

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        class="register-form"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
            clearable
            :disabled="registrationDisabled"
          />
        </el-form-item>

        <el-form-item prop="real_name">
          <el-input
            v-model="registerForm.real_name"
            placeholder="真实姓名"
            size="large"
            :prefix-icon="UserFilled"
            clearable
            :disabled="registrationDisabled"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
            :disabled="registrationDisabled"
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
            :disabled="registrationDisabled"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-btn"
            :disabled="registrationDisabled"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>

        <div class="login-tip">
          已有账号？
          <el-button type="primary" link @click="goToLogin">立即登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { User, UserFilled, Lock } from '@element-plus/icons-vue'
import api from '../api'

const router = useRouter()
const authStore = useAuthStore()

const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const registrationDisabled = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  real_name: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为 3-20 个字符', trigger: 'blur' }
  ],
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '真实姓名长度应为 2-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为 6-20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function loadPublicSettings() {
  try {
    const response = await api.get('/app-settings/public')
    registrationDisabled.value = !Boolean(response.data?.data?.allowRegistration)
    if (registrationDisabled.value) {
      ElMessage.warning('当前已关闭学员注册，请联系管理员开通账号')
    }
  } catch {
    registrationDisabled.value = true
  }
}

const handleRegister = async () => {
  if (registrationDisabled.value || !registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await authStore.register(
        registerForm.username,
        registerForm.password,
        registerForm.real_name
      )
      ElMessage.success('注册成功')
      router.push('/')
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || '注册失败')
      if (error.response?.status === 403) {
        registrationDisabled.value = true
      }
    } finally {
      loading.value = false
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  loadPublicSettings()
})
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 24px;
}

.register-header h1 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 8px;
}

.register-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.disabled-alert {
  margin-bottom: 20px;
}

.register-form {
  margin-top: 20px;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-tip {
  text-align: center;
  margin-top: 16px;
  color: #7f8c8d;
  font-size: 14px;
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'
import { encryptPassword } from '@/utils/crypto'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  captcha: '',
})

const captchaUuid = ref('')
const captchaImgUrl = ref('')

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
  captcha: [{ required: true, message: '请输入验证码' }],
}

const loading = ref(false)

const handleSubmit = async ({ errors, values }: any) => {
  if (errors) return

  loading.value = true
  try {
    const loginPayload = {
      username: form.username,
      password: encryptPassword(form.password),
      code: form.captcha.toLowerCase(),
      uuid: captchaUuid.value,
    }

    await userStore.login(loginPayload)

    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')

  } catch (error) {
    console.error('登录失败', error)
    form.captcha = ''
    handleRefreshCaptcha()
  } finally {
    loading.value = false
  }
}

const handleRefreshCaptcha = async () => {
  try {
    const res = await axios.get('/api/captcha', { responseType: 'blob' });
    const uuid = res.headers['captcha-uuid'];
    if (uuid) captchaUuid.value = uuid;
    captchaImgUrl.value = URL.createObjectURL(res.data);
  } catch (e) {
    console.error('获取验证码失败', e);
  }
}

onMounted(() => {
  handleRefreshCaptcha()
})

</script>

<template>
  <div class="login-page">
    <div class="glow-bg"></div>

    <div class="login-card anim-slide-up">
      <div class="login-header">
        <h1>Login</h1>
        <p class="subtitle">登录到物流管理系统</p>
      </div>

      <a-form :model="form" :rules="rules" @submit="handleSubmit" layout="vertical">
        <a-form-item field="username" label="用户名" hide-asterisk>
          <a-input
              v-model="form.username"
              placeholder="请输入账号"
              allow-clear
              size="large"
              class="custom-input"
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item field="password" label="密码" hide-asterisk>
          <a-input-password
              v-model="form.password"
              placeholder="请输入密码"
              allow-clear
              size="large"
              class="custom-input"
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item field="captcha" label="验证码" hide-asterisk>
          <div class="captcha-wrapper">
            <a-input
                v-model="form.captcha"
                placeholder="请输入验证码"
                allow-clear
                size="large"
                class="custom-input"
            >
              <template #prefix>
                <icon-lock />
              </template>
            </a-input>
            <img
                v-if="captchaImgUrl"
                :src="captchaImgUrl"
                alt="验证码"
                class="captcha-img"
                @click="handleRefreshCaptcha"
            />
            <span v-else class="captcha-placeholder" @click="handleRefreshCaptcha">加载中...</span>
          </div>
        </a-form-item>

        <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            class="login-btn"
            size="large"
            long
        >
          登 录
        </a-button>
      </a-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 基础背景色 */
  background-color: var(--color-bg-1);
  overflow: hidden;

  /* 使用绝对定位绘制背景光晕，不影响页面主体布局 */
  .glow-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* 使用 Arco 的变量实现双光源渐变，兼容亮/暗模式 */
    background-image:
        radial-gradient(circle at 15% 50%, var(--color-primary-light-2), transparent 25%),
        radial-gradient(circle at 85% 30%, var(--color-primary-light-3), transparent 25%);
    filter: blur(60px); /* 让光晕变得非常柔和 */
    z-index: 0;
    pointer-events: none;
  }

  .login-card {
    position: relative;
    z-index: 1; /* 确保卡片在光晕层之上 */
    width: 100%;
    max-width: 420px;
    padding: 48px 40px;
    /* 引入微弱的毛玻璃效果 */
    background: rgba(var(--gray-1), 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    /* 增加弥散的高级阴影，取代之前生硬的阴影 */
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05), 0 4px 16px rgba(0, 0, 0, 0.02);

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px;
        color: var(--color-text-1);
        letter-spacing: 1px;
      }

      .subtitle {
        color: var(--color-text-3);
        font-size: 14px;
      }
    }

    :deep(.arco-form-item-label) {
      color: var(--color-text-2);
      font-weight: 500;
      margin-bottom: 8px;
    }

    /* 核心修改：优化输入框质感 */
    :deep(.custom-input),
    :deep(.custom-input.arco-input-password) {
      /* 使用官方推荐的输入框底色，与纯白卡片拉开层次 */
      background-color: var(--color-fill-2) !important;
      /* 增加实线边框，明确输入区域边界 */
      border: 1px solid var(--color-neutral-3) !important;
      color: var(--color-text-1) !important;
      border-radius: 8px; /* 增加圆角，显得更现代 */
      transition: all 0.2s ease-in-out;

      &:hover {
        background-color: var(--color-fill-3) !important;
        border-color: var(--color-primary-light-3) !important;
      }

      &.arco-input-focus {
        background-color: var(--color-bg-2) !important;
        border-color: var(--color-primary) !important;
        box-shadow: 0 0 0 2px var(--color-primary-light-2); /* 增加一层 focus 光圈 */
      }
    }

    .login-btn {
      font-weight: 600;
      margin-top: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px var(--color-primary-light-2); /* 按钮也加点发光特效 */
      transition: all 0.2s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px var(--color-primary-light-3);
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }
}

.anim-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.captcha-img {
  width: 100px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid var(--color-neutral-3);
  flex-shrink: 0;
}

.captcha-placeholder {
  width: 100px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid var(--color-neutral-3);
  background-color: var(--color-fill-2);
  color: var(--color-text-3);
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.captcha-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
</style>
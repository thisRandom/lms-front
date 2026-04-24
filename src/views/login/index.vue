<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const form = ref({
  username: '',
  password: '',
})
const loading = ref(false)

const handleSubmit = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/dashboard')
  }, 1000)
}
</script>

<template>
  <div class="login-page">
    <div class="login-card anim-slide-up">
      <div class="login-header">
<!--        <div class="logo-circle">-->
<!--          <span class="dot"></span>-->
<!--        </div>-->
        <h1>Login</h1>
        <p class="subtitle">登录到物流管理系统</p>
      </div>

      <a-form :model="form" @submit="handleSubmit">
        <a-form-item field="username" label="用户名">
          <a-input v-model="form.username" placeholder="账号" allow-clear>
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model="form.password" placeholder="密码" allow-clear>
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" class="login-btn" long>
          登录
        </a-button>
      </a-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-1);

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 40px;
    background: var(--color-bg-2);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    .login-header {
      text-align: center;
      margin-bottom: 32px;

      h1 {
        font-size: 24px;
        margin: 16px 0 8px;
        color: var(--color-text-1);
      }

      .subtitle {
        color: var(--color-text-3);
        font-size: 14px;
      }

      .logo-circle {
        width: 48px;
        height: 48px;
        background: var(--color-text-1);
        border-radius: 12px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;

        .dot {
          width: 8px;
          height: 8px;
          background: var(--color-primary);
          border-radius: 50%;
        }
      }
    }

    :deep(.arco-form-item-label) {
      color: var(--color-text-2);
    }

    :deep(.arco-input-wrapper),
    :deep(.arco-input-password) {
      background-color: var(--color-bg-3) !important;
      border: 1px solid var(--color-border) !important;
      color: var(--color-text-1) !important;
    }

    .login-btn {
      height: 40px;
      font-weight: 600;
      margin-top: 8px;
    }
  }
}

.anim-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  if (window.localStorage.getItem('role') === 'CUSTOMER') {
    router.push('/customer/myOrder')
  } else {
    router.push('/dashboard')
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <svg viewBox="0 0 200 200" class="icon-svg">
          <circle cx="100" cy="100" r="90" fill="#f2f3f5" />
          <text x="100" y="130" text-anchor="middle" font-size="80" font-weight="bold" fill="#FF7D00">403</text>
        </svg>
      </div>
      <div class="error-info">
        <h1>无访问权限</h1>
        <p>抱歉，您没有权限访问该页面</p>
      </div>
      <div class="error-actions">
        <a-button type="primary" size="large" @click="goHome">
          返回首页
        </a-button>
        <a-button size="large" @click="goBack">
          返回上一页
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-1);
  padding: 40px;
}

.error-content {
  text-align: center;
  max-width: 480px;
}

.error-icon {
  margin-bottom: 32px;
}

.icon-svg {
  width: 180px;
  height: 180px;
}

.error-info {
  margin-bottom: 32px;
}

.error-info h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 12px;
}

.error-info p {
  font-size: 14px;
  color: var(--color-text-3);
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
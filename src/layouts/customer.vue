<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

interface MenuItem {
  key: string
  title: string
  icon: any
  path: string
}

const customerMenus: MenuItem[] = [
  { key: 'myOrder', title: '我的订单', icon: 'file', path: '/customer/myOrder' },
  { key: 'POder', title: '立即下单', icon: 'send', path: '/customer/POder' },
  { key: 'settings', title: '个人设置', icon: 'settings', path: '/customer/settings' },
]

const selectedKey = computed(() => route.path.split('/').pop() || '')

const handleMenuClick = (key: string) => {
  const menu = customerMenus.find((m) => m.key === key)
  if (menu) {
    router.push(menu.path)
  }
}

const handleLogout = async () => {
  try {
    await userStore.logout();
  } catch (e) {
    console.warn('后端登出接口异常，但前端仍会清除状态', e);
  } finally {
    router.push('/login');
  }
}
</script>

<template>
  <div class="customer-layout">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">物流服务</div>
      </div>
      <nav class="nav-menu">
        <div
            v-for="menu in customerMenus"
            :key="menu.key"
            :class="['nav-item', { active: selectedKey === menu.key }]"
            @click="handleMenuClick(menu.key)"
        >
          {{ menu.title }}
        </div>
      </nav>
      <div class="header-right">
        <span class="username">{{ userStore.realName || userStore.username }}</span>
        <a-button type="text" size="small" @click="handleLogout">退出</a-button>
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.customer-layout {
  min-height: 100vh;
  background: var(--color-bg-1);
}

.header {
  height: 60px;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.15);
}

.header-left {
  .logo {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 1px;
  }
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.nav-item {
  padding: 8px 24px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-weight: 500;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;

  .username {
    color: #fff;
    font-size: 14px;
    opacity: 0.9;
  }

  :deep(.arco-btn-text) {
    color: rgba(255, 255, 255, 0.85);

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.content {
  min-height: calc(100vh - 60px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

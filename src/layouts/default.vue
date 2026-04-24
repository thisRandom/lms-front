<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  IconHome,
  IconUser,
  IconDriveFile,
  IconFile,
  IconList,
  IconLocation,
  IconSettings,
  IconMenu,
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const selectedKey = computed(() => route.path)
const collapsed = ref(false)

interface MenuItem {
  key: string
  title: string
  icon: any
  path: string
  roles?: string[]
}

const allMenus: MenuItem[] = [
  { key: 'dashboard', title: '首页', icon: IconHome, path: '/dashboard' },
  { key: 'user', title: '用户管理', icon: IconUser, path: '/dashboard/user', roles: ['ADMIN'] },
  { key: 'vehicle', title: '车辆管理', icon: IconDriveFile, path: '/dashboard/vehicle', roles: ['ADMIN', 'DISPATCHER', 'DRIVER'] },
  { key: 'order', title: '订单管理', icon: IconFile, path: '/dashboard/order' },
  { key: 'dispatch', title: '调度管理', icon: IconList, path: '/dashboard/dispatch', roles: ['ADMIN', 'DISPATCHER', 'DRIVER'] },
  { key: 'location', title: '轨迹管理', icon: IconLocation, path: '/dashboard/location' },
  { key: 'settings', title: '系统设置', icon: IconSettings, path: '/dashboard/settings' },
]

const menuData = computed(() => {
  const role = userStore.userInfo.role
  return allMenus.filter((menu) => {
    if (!menu.roles) return true
    return menu.roles.includes(role)
  })
})

const handleMenuClick = (key: string) => {
  const menu = menuData.value.find((m) => m.key === key)
  if (menu) {
    router.push(menu.path)
  }
}
</script>

<template>
  <a-layout class="layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :width="220"
      :collapsible="true"
      :trigger="null"
      class="sider"
    >
      <div class="logo">
        <span v-if="!collapsed">LMS</span>
        <span v-else>L</span>
      </div>
      <a-menu
        :default-selected-keys="[selectedKey]"
        class="menu"
        @menu-item-click="(key: string) => handleMenuClick(key)"
      >
        <a-menu-item v-for="menu in menuData" :key="menu.key">
          <component :is="menu.icon" class="menu-icon" />
          <span>{{ menu.title }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <component :is="IconMenu" class="collapse-icon" @click="collapsed = !collapsed" />
        </div>
        <div class="header-right">
          <span class="username">{{ userStore.userInfo.realName || userStore.userInfo.username }}</span>
          <a-button type="text" @click="userStore.reset(); router.push('/login')">退出</a-button>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
}

.sider {
  background: var(--color-bg-2);

  :deep(.arco-layout-sider-children) {
    display: flex;
    flex-direction: column;
  }
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: var(--color-primary);
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
}

.menu {
  background: var(--color-bg-2);
  border: none;

  :deep(.arco-menu-inner) {
    padding: 8px 0;
  }

  :deep(.arco-menu-item) {
    height: 44px;
    line-height: 44px;
    margin: 4px 8px;
    border-radius: 8px;
    color: var(--color-text-2);

    &:hover {
      background: var(--color-fill-2);
    }

    &.arco-menu-item-selected {
      background: var(--color-primary-light-1);
      color: var(--color-primary);
    }
  }
}

.menu-icon {
  font-size: 16px;
  margin-right: 8px;
}

.header {
  background: var(--color-bg-2);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-2);

  &:hover {
    color: var(--color-text-1);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: var(--color-text-2);
  font-size: 14px;
}

.content {
  padding: 24px;
  background: var(--color-bg-1);
  min-height: calc(100vh - 60px);
}
</style>

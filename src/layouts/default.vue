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
  IconSunFill,
  IconMoonFill
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const selectedKey = computed(() => route.path.split('/').pop() || '')
const collapsed = ref(false)
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.body.setAttribute('arco-theme', 'dark')
  } else {
    document.body.removeAttribute('arco-theme')
  }
}

interface MenuItem {
  key: string
  title: string
  icon: any
  path: string
  roles?: string[]
}

// 核心修改 1：对齐刚才在 Router 中定义的路由级权限角色
const allMenus: MenuItem[] = [
  { key: 'dashboard', title: '首页', icon: IconHome, path: '/dashboard', roles: ['*'] },
  { key: 'vehicle', title: '车辆管理', icon: IconDriveFile, path: '/dashboard/vehicle', roles: ['ADMIN', 'DISPATCHER'] },
  { key: 'order', title: '订单管理', icon: IconFile, path: '/dashboard/order', roles: ['ADMIN', 'MANAGER', 'editor'] },
  { key: 'myOrder', title: '我的订单', icon: IconFile, path: '/dashboard/myOrder', roles: ['CUSTOMER'] },
  { key: 'dispatch', title: '调度管理', icon: IconList, path: '/dashboard/dispatch', roles: ['ADMIN', 'MANAGER', 'editor'] },
  { key: 'location', title: '轨迹管理', icon: IconLocation, path: '/dashboard/location', roles: ['ADMIN', 'MANAGER', 'editor', 'viewer'] },
  { key: 'user', title: '用户管理', icon: IconUser, path: '/dashboard/user', roles: ['ADMIN','DISPATCHER'] },
  { key: 'my-vehicle', title: '我的车辆', icon: IconUser, path: '/dashboard/my-vehicle', roles: ['DRIVER'] },
  { key: 'settings', title: '个人设置', icon: IconSettings, path: '/dashboard/settings', roles: ['*'] },
]

// 核心修改 2：适配新的 Store 结构和通配符逻辑
const menuData = computed(() => {
  const currentRole = userStore.role
  return allMenus.filter((menu) => {
    // 如果没有配置 roles 或者配置了 '*'，则所有角色可见
    if (!menu.roles || menu.roles.includes('*')) return true
    // 否则判断当前用户的角色是否在菜单的权限列表中
    return menu.roles.includes(currentRole)
  })
})

const handleMenuClick = (key: string) => {
  const menu = menuData.value.find((m) => m.key === key)
  if (menu) {
    router.push(menu.path)
  }
}

// 核心修改 3：对接完整的退出登录生命周期
const handleDropdownSelect = async (value: string | number | Record<string, any> | undefined) => {
  if (value === 'logout') {
    try {
      await userStore.logout();
    } catch (e) {
      console.warn('后端登出接口异常，但前端仍会清除状态', e);
    } finally {
      // 无论后端接不接口报错，前端必须强制跳回登录页
      router.push('/login');
    }
  }
}

// keep-alive 缓存控制：只激活当前页面和首页
const keepAliveNames = ref<string[]>(['dashboard-home']);

router.afterEach((to) => {
  if (to.meta?.keepAlive) {
    keepAliveNames.value = [to.name as string];
  }
});
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
        <span v-if="!collapsed">物流管理系统</span>
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
          <a-tooltip :content="isDark ? '切换亮色模式' : '切换暗色模式'" position="bottom">
            <a-button shape="circle" type="text" @click="toggleTheme">
              <template #icon>
                <icon-moon-fill v-if="isDark"/>
                <icon-sun-fill v-else/>
              </template>
            </a-button>
          </a-tooltip>
          <a-dropdown trigger="click" @select="handleDropdownSelect">
            <div class="user-info">
              <a-avatar :style="{ backgroundColor: '#3370ff' }" :size="32">
                <IconUser/>
              </a-avatar>
              <span class="username">{{ userStore.username || '未命名用户' }}</span>
            </div>
            <template #content>
              <a-doption value="logout" style="color: #f53f3f">
                <template #prefix><IconMenu /></template>
                退出登录
              </a-doption>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="keepAliveNames">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style lang="scss" scoped>
/* 样式部分完全保留你的原版设计，无需改动 */
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
  color: var(--color-neutral-10);
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

.theme-toggle {
  margin-left: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-fill-1);
  }
}

.theme-icon {
  font-size: 18px;
  color: var(--color-text-2);

  &:hover {
    color: var(--color-text-1);
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-fill-1);
  }
}

.username {
  color: var(--color-text-1);
  font-size: 14px;
  font-weight: 500;
}

.content {
  padding: 24px;
  background: var(--color-bg-1);
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
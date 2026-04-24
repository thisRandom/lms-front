<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import router from '@/router'

const route = useRoute()
const collapsed = ref(false)

const menuData = [
  {
    key: 'dashboard',
    title: '仪表盘',
    icon: 'icon-home',
    children: [
      { key: 'dashboard-workplace', title: '工作台', path: '/dashboard/workplace' },
    ],
  },
]

const selectedKey = ref<string[]>([route.path])

const handleMenuClick = (key: string, path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="layout">
    <a-layout class="layout-main">
      <a-layout-sider
        v-model:collapsed="collapsed"
        :width="220"
        :collapsible="true"
        class="sider"
      >
        <div class="logo">
          <span v-if="!collapsed">LMS</span>
          <span v-else>L</span>
        </div>
        <a-menu
          v-model:selected-keys="selectedKey"
          class="menu"
          @menu-item-click="(key: string) => {
            const item = menuData.find(m => m.key === key) ||
              menuData.flatMap(m => m.children || []).find(c => c.key === key)
            if (item && 'path' in item) {
              handleMenuClick(key, item.path)
            }
          }"
        >
          <a-sub-menu key="dashboard">
            <template #title>
              <span class="menu-icon">🏠</span>
              <span>仪表盘</span>
            </template>
            <a-menu-item key="dashboard" @click="router.push('/dashboard')">
              工作台
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>

      <a-layout>
        <a-layout-header class="header">
          <div class="header-title">{{ route.meta?.locale || 'LMS' }}</div>
        </a-layout-header>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<style scoped>
.layout-main {
  min-height: 100vh;
}
.sider {
  background: #1d2125;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  background: #141519;
}
.menu {
  background: #1d2125;
}
.menu :deep(.arco-menu-inner) {
  background: #1d2125;
}
.menu-icon {
  margin-right: 8px;
}
.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.header-title {
  font-size: 16px;
  font-weight: 500;
}
.content {
  padding: 24px;
  background: #f5f6f7;
  min-height: calc(100vh - 60px);
}
</style>

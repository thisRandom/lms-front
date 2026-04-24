import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/default.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard-home',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { requiresAuth: true, locale: '首页', icon: 'icon-home' },
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/user/index.vue'),
        meta: { requiresAuth: true, locale: '用户管理', icon: 'icon-user', permissions: ['user:view'] },
      },
      {
        path: 'vehicle',
        name: 'vehicle',
        component: () => import('@/views/vehicle/index.vue'),
        meta: { requiresAuth: true, locale: '车辆管理', icon: 'icon-truck', permissions: ['vehicle:view'] },
      },
      {
        path: 'order',
        name: 'order',
        component: () => import('@/views/order/index.vue'),
        meta: { requiresAuth: true, locale: '订单管理', icon: 'icon-document', permissions: ['order:view'] },
      },
      {
        path: 'dispatch',
        name: 'dispatch',
        component: () => import('@/views/dispatch/index.vue'),
        meta: { requiresAuth: true, locale: '调度管理', icon: 'icon-list', permissions: ['dispatch:view'] },
      },
      {
        path: 'location',
        name: 'location',
        component: () => import('@/views/location/index.vue'),
        meta: { requiresAuth: true, locale: '轨迹管理', icon: 'icon-location', permissions: ['location:query'] },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { requiresAuth: true, locale: '系统设置', icon: 'icon-settings' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')

  // 公开路由直接放行
  if (!to.meta.requiresAuth) {
    if (to.path === '/login' && token && userStore.userInfo.username) {
      return '/dashboard'
    }
    return true
  }

  // 需要登录但无 token
  if (!token) {
    return '/login'
  }

  // 检查路由权限
  const requiredPermissions = to.meta.permissions as string[] | undefined
  if (requiredPermissions?.length) {
    if (!userStore.hasAnyPermission(requiredPermissions)) {
      return '/dashboard'
    }
  }

  return true
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      requiresAuth: false,
      locale: '登录',
    },
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/layouts/default.vue'),
    meta: {
      requiresAuth: true,
      locale: '仪表盘',
      icon: 'icon-home',
    },
    children: [
      {
        path: '',
        name: 'workplace',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          requiresAuth: true,
          locale: 'menu.dashboard.workplace',
          roles: ['admin'],
        },
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

export default router

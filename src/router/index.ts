import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import setupPermissionGuard from './permission'


const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/loginView.vue'),
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
                component: () => import('@/views/dashboard.vue'),
                // 所有角色均可访问首页，使用 '*' 或者不写 roles
                meta: { requiresAuth: true, locale: '首页', icon: 'icon-home', roles: ['*'] },
            },
            {
                path: 'vehicle',
                name: 'vehicle',
                component: () => import('@/views/vehicleManage.vue'),
                meta: { requiresAuth: true, locale: '车辆管理', icon: 'icon-truck', roles: ['ADMIN', 'DISPATCHER'], keepAlive: true },
            },
            {
                path: 'order',
                name: 'order',
                component: () => import('@/views/orderManage.vue'),
                meta: { requiresAuth: true, locale: '订单管理', icon: 'icon-document', roles: ['ADMIN', 'DISPATCHER', 'DRIVER'], keepAlive: true },
            },
            {
                path: 'myOrder',
                name: 'myOrder',
                component: () => import('@/views/myOrderManage.vue'),
                meta: { requiresAuth: true, locale: '订单管理', icon: 'icon-document', roles: ['CUSTOMER'], keepAlive: true },
            },
            {
                path: 'POder',
                name: 'POder',
                component: () => import('@/views/POrderManage.vue'),
                meta: { requiresAuth: true, locale: '立即下单', icon: 'icon-document', roles: ['CUSTOMER'], keepAlive: true },
            },
            {
                path: 'dispatch',
                name: 'dispatch',
                component: () => import('@/views/dispatchManage.vue'),
                meta: { requiresAuth: true, locale: '调度管理', icon: 'icon-list', roles: ['DISPATCHER'], keepAlive: true },
            },
            {
                path: 'location',
                name: 'location',
                component: () => import('@/views/locationManage.vue'),
                meta: { requiresAuth: true, locale: '轨迹管理', icon: 'icon-location', roles: ['ADMIN', 'manager', 'editor', 'viewer'], keepAlive: true },
            },
            {
                path: 'user',
                name: 'user',
                component: () => import('@/views/userManage.vue'),
                meta: { requiresAuth: true, locale: '用户管理', icon: 'icon-user', roles: ['ADMIN','DISPATCHER'], keepAlive: true },
            },
            {
                path: 'settings',
                name: 'settings',
                component: () => import('@/views/userSetting.vue'),
                meta: { requiresAuth: true, locale: '个人设置', icon: 'icon-settings', roles: ['*'] },
            },
            {
                path: 'my-vehicle',
                name: 'my-vehicle',
                component: () => import('@/views/myVehicle.vue'),
                meta: { requiresAuth: true, locale: '我的车辆', icon: 'icon-truck', roles: ['DRIVER'], keepAlive: true },
            },
        ],
    },
    // ================= 补充异常处理页面 =================
    {
        path: '/404',
        name: 'Error404',
        // 提示：你需要在 views 目录下建一个 error/404.vue 页面
        component: () => import('@/views/error/404.vue'),
        meta: { requiresAuth: false },
    },
    {
        // Vue3 Router 的 404 捕获写法 (替换掉原来的直接 redirect)
        path: '/:pathMatch(.*)*',
        redirect: '/404',
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// === 核心：挂载全局权限守卫 ===
setupPermissionGuard(router)

export default router
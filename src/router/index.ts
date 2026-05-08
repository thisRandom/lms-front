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
        path: '/about',
        name: 'about',
        component: () => import('@/views/aboutView.vue'),
        meta: { requiresAuth: false },
    },
    {
        path: '/',
        redirect: '/dashboard',
    },
    // ========== B端用户路由（管理员/调度员/司机） ==========
    {
        path: '/dashboard',
        component: () => import('@/layouts/default.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'dashboard-home',
                component: () => import('@/views/dashboard.vue'),
                meta: { requiresAuth: true, locale: '首页', icon: 'icon-home', roles: ['ADMIN', 'DISPATCHER', 'DRIVER'] },
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
                meta: { requiresAuth: true, locale: '订单管理', icon: 'icon-document', roles: ['ADMIN', 'DISPATCHER'], keepAlive: true },
            },
            {
                path: 'dispatch',
                name: 'dispatch',
                component: () => import('@/views/dispatchManage.vue'),
                meta: { requiresAuth: true, locale: '调度管理', icon: 'icon-list', roles: ['DISPATCHER', 'DRIVER'], keepAlive: true },
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
                meta: { requiresAuth: true, locale: '个人设置', icon: 'icon-settings', roles: ['ADMIN', 'DISPATCHER', 'DRIVER'] },
            },
            {
                path: 'my-vehicle',
                name: 'my-vehicle',
                component: () => import('@/views/myVehicle.vue'),
                meta: { requiresAuth: true, locale: '我的车辆', icon: 'icon-truck', roles: ['DRIVER'], keepAlive: true },
            },
            {
                path: 'driver-home',
                name: 'driver-home',
                component: () => import('@/views/driverDashboard.vue'),
                meta: { requiresAuth: true, locale: '首页', roles: ['DRIVER'] },
            },
        ],
    },
    // ========== C端用户路由（客户） ==========
    {
        path: '/customer',
        component: () => import('@/layouts/customer.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: '/customer/myOrder',
            },
            {
                path: 'myOrder',
                name: 'myOrder',
                component: () => import('@/views/customer/MyOrderNew.vue'),
                meta: { requiresAuth: true, locale: '我的订单' },
            },
            {
                path: 'POder',
                name: 'POder',
                component: () => import('@/views/POrderManage.vue'),
                meta: { requiresAuth: true, locale: '立即下单' },
            },
            {
                path: 'settings',
                name: 'customer-settings',
                component: () => import('@/views/customer/CustomerSettings.vue'),
                meta: { requiresAuth: true, locale: '个人设置' },
            },
        ],
    },
    // ================= 补充异常处理页面 =================
    {
        path: '/404',
        name: 'Error404',
        component: () => import('@/views/error/404.vue'),
        meta: { requiresAuth: false },
    },
    {
        path: '/403',
        name: 'Error403',
        component: () => import('@/views/error/403.vue'),
        meta: { requiresAuth: false },
    },
    {
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
import type { Router } from 'vue-router';
import { useUserStore } from '@/stores/user.ts';
import { getToken, isTokenExpired } from '@/utils/auth';

// 1. 定义白名单：不需要登录就可以访问的路径
const whiteList = ['/login', '/about', '/404', '/403'];

export default function setupPermissionGuard(router: Router) {
    router.beforeEach(async (to, from, next) => {
        // 获取持久化的 Token 和内存中的状态
        const token = getToken();
        const userStore = useUserStore();

// ================== 情况 A：用户已登录 (有 Token) ==================
        if (token) {
            // 1. 如果用户已经登录，却还要去访问登录页，直接把他踹回首页
            if (to.path === '/login') {
                // 根据角色重定向到不同的首页
                if (userStore.role === 'CUSTOMER') {
                    next({ path: '/customer/myOrder' });
                } else {
                    next({ path: '/dashboard' });
                }
                return;
            }

            // 2. 处理 F5 刷新导致 Pinia 角色丢失的问题
            // 核心修复：增加对 'ERROR' 初始值的判断
            if (!userStore.role || userStore.role === 'ERROR') {
                // 先检查本地 Token 是否已过期，避免无效请求
                if (isTokenExpired()) {
                    userStore.resetInfo();
                    next(`/login?redirect=${to.path}`);
                    return;
                }
                try {
                    // 重新拉取用户信息
                    await userStore.fetchUserInfo();
                } catch (error) {
                    // 如果拉取失败（比如 Token 在后端过期了），清除前端缓存并跳回登录页
                    userStore.resetInfo();
                    next(`/login?redirect=${to.path}`);
                    return;
                }
            }

            // 3. 刷新后如果目标是根首页，根据角色重定向
            if (to.path === '/' || to.path === '/dashboard') {
                if (userStore.role === 'CUSTOMER') {
                    next({ path: '/customer/myOrder', replace: true });
                } else if (userStore.role === 'DRIVER') {
                    next({ path: '/dashboard/driver-home', replace: true });
                } else {
                    next();
                }
                return;
            }

            // 4. RBAC 权限比对逻辑
            // 从目标路由的 meta 中读取允许访问的角色列表
            const requiredRoles = (to.meta.roles as string[]) || [];

            // 如果没有配置 roles，或者配置了 '*'，说明该页面不限制角色，直接放行
            if (requiredRoles.length === 0 || requiredRoles.includes('*')) {
                next();
                return;
            }

            // 检查当前用户的角色是否在允许的列表中
            if (requiredRoles.includes(userStore.role)) {
                next(); // 匹配成功，放行！
                return;
            } else {
                // 核心修复：匹配失败，必须要有一个结局，把他踢到无权限页面
                console.warn(`越权访问拦截: 需要 ${requiredRoles}, 当前是 ${userStore.role}`);
                next('/403');
                return;
            }
        }
        // ================== 情况 B：用户未登录 (无 Token) ==================
        else {
            if (whiteList.includes(to.path)) {
                next(); // 如果要去的是白名单页面，直接放行
            } else {
                // 试图访问受保护的页面，打回登录页，并把原本想去的路径通过 URL 参数带过去
                // 这样用户登录成功后，可以直接跳回他原来想看的页面（极其加分的用户体验细节）
                next(`/login?redirect=${to.path}`);
            }
        }
    });
}
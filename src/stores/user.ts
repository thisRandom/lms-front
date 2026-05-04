import { defineStore } from 'pinia';
import { getUserInfo, login as userLogin, updateUserInfo } from '@/api/user';
import { setToken, clearToken, getToken } from '@/utils/auth';
import type { UserState, RoleType } from './types'; // 去掉 .ts 后缀，Vite/Webpack 会自动解析

export const useUserStore = defineStore('user', {
    // 1. 定义 State
    state: (): UserState => ({
        username: undefined,
        realName: '',
        phone: '',
        role: 'ERROR',
        token: getToken() || undefined,
        expireTime: 0,
        isLoggedIn: false
    }),

    // 2. 定义 Actions
    actions: {
        // 辅助方法：批量原子化更新状态 (极其重要，避免多次触发视图更新)
        setInfo(partial: Partial<UserState>) {
            this.$patch(partial);
        },

        // 辅助方法：重置所有状态到初始值，并清空本地缓存
        resetInfo() {
            this.$reset();
            clearToken();
        },

        // 登录核心逻辑
        async login(loginForm: any) {
            try {
                const res = await userLogin(loginForm);

                // 解构出后端返回的数据
                const { token, expireTime, user } = res.data;

                const { role, username, realName } = user;

                setToken(token, expireTime); // 存入 localStorage

                // 更新内存状态
                this.setInfo({
                    token,
                    role: role as RoleType,
                    username,
                    realName,
                    expireTime: expireTime || 0,
                    isLoggedIn: true,
                });

            } catch (err) {
                // 登录失败时，确保清空可能残留的无效 Token
                clearToken();
                throw err;
            }
        },
        /**
         * 更新用户资料的 Action
         * @param data 包含要修改的字段的对象
         */
        async updateProfile(data: Partial<UserState>) {
            try {
                // 1. 发起后端请求
                await updateUserInfo(data);

                // 2. 请求成功后，重新调用 /auth/current 获取最新用户信息
                await this.fetchUserInfo();

                return; // 返回结果供组件层处理（如显示成功提示）
            } catch (err) {
                throw err;
            }
        },
        async fetchUserInfo() {
            try {
                const res = await getUserInfo();
                const { role, username, realName, phone } = res.data;

                this.setInfo({
                    role: role as RoleType,
                    username,
                    realName,
                    phone,
                    isLoggedIn: true,
                });
            } catch (err) {
                this.resetInfo();
                throw err;
            }
        },

        // 退出登录逻辑 (生命周期闭环)
        async logout() {
            // 密码修改后 token 已失效，直接清理本地状态并跳转登录页，不调 logout 接口避免 401 弹框
            this.resetInfo();
        }
    }
});
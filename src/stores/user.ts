import { defineStore } from 'pinia';
import {getUserInfo, login as userLogin, Logout as userLogout, updateUserInfo} from '@/api/user';
import { setToken, clearToken, getToken } from '@/utils/auth';
import type { UserState, RoleType } from './types'; // 去掉 .ts 后缀，Vite/Webpack 会自动解析

export const useUserStore = defineStore('user', {
    // 1. 定义 State
    state: (): UserState => ({
        username: undefined,
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

                // 解构出后端返回的数据，增加对 expireTime 的解构
                const { token, expireTime, user } = res.data;

                const { role, username, realName, avatar } = user;

                setToken(token); // 存入 localStorage

                // 更新内存状态
                this.setInfo({
                    token,
                    role: role as RoleType,
                    username,
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
                const res = await updateUserInfo(data);

                // 2. 请求成功后，将修改后的数据同步到 Pinia
                // 注意：这里建议使用后端返回的最新数据 res.data 来更新，
                // 也可以直接用传入的参数 data 来更新。
                const updatedData = res.data || data;

                this.setInfo(updatedData);

                return res; // 返回结果供组件层处理（如显示成功提示）
            } catch (err) {
                // 如果后端校验失败（如昵称重复），错误会被 Axios 拦截器捕获
                throw err;
            }
        },
        async fetchUserInfo() {
            try {
                const res = await getUserInfo();
                const { role, username } = res.data;

                this.setInfo({
                    role: role as RoleType,
                    username,
                    isLoggedIn: true,
                });
            } catch (err) {
                this.resetInfo();
                throw err;
            }
        },

        // 退出登录逻辑 (生命周期闭环)
        async logout() {
            try {
                // 1. 必须加上 await，让代码等待请求结果
                await userLogout();
            } catch (err) {
                // 2. 增加 catch 块：如果后端没有写登出接口或者登出报错，
                // 我们在这里把它“默默吃掉”，不再往外抛出，防止控制台飙红
                console.warn('退出登录接口报错，忽略异常', err);
            } finally {
                // 无论如何，前端必须清理干净
                this.resetInfo();
            }
        }
    }
});
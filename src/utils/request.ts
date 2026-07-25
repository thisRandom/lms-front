import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { getToken, clearToken } from '@/utils/auth';
import router from '@/router';

// 扩展 axios 请求配置：silent 为 true 时，响应拦截器不弹全局错误提示，
// 错误仅通过 Promise.reject 抛出，由调用方自行决定如何展示
declare module 'axios' {
    export interface AxiosRequestConfig {
        silent?: boolean;
    }
}

// 定义后端返回的通用数据结构
export interface HttpResponse<T = any> {
    code: number | string; // 兼容后端返回字符串的情况
    message?: string;
    msg?: string;          // 兼容你后端的 msg 字段
    data: T;
}

// 1. 创建 axios 实例
const service: AxiosInstance = axios.create({
    // baseURL 会根据环境变量自动切换 (需要在 .env 文件中配置 VITE_API_BASE_URL)
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000, // 超时时间：10秒
});

// 2. 请求拦截器 (Request Interceptor)
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 每次发送请求之前，判断是否存在 token，如果存在则在请求头携带 token
        const token = getToken();
        if (token) {
            config.headers.Authorization = `${token}`;
        }
        return config;
    },
    (error: any) => {
        // 请求发生错误时的处理
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// 3. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
    (response: AxiosResponse<HttpResponse>) => {
        // blob 响应（如文件下载、图片请求）直接返回，不做 JSON 解析
        if (response.config.responseType === 'blob') {
            return response.data;
        }

        const res = response.data;

        if (res.code !== 200) {
            // silent 请求（如登录页）不弹全局提示，交由调用方自行展示错误
            if (!response.config.silent) {
                Message.error({
                    content: res.msg || res.message || '未知业务错误',
                    duration: 5000,
                });
            }

            // 401: Token 过期或未登录
            if (res.code === 401) {
                Modal.error({
                    title: '登录失效',
                    content: '您的登录状态已失效，请重新登录',
                    okText: '重新登录',
                    async onOk() {
                        clearToken();
                        // 重定向到登录页，并携带当前页面地址以便登录后跳回
                        window.location.reload();
                    },
                });
            }
            // 403: 无权限访问 (RBAC 核心)
            else if (res.code === 403) {
                router.push({ name: 'Error403' });
            }

            // 抛出错误，阻止在具体 API 调用处的 .then() 执行
            return Promise.reject(new Error(res.msg || res.message || 'Error'));
        }

        // 核心修改点：强转为 any 绕过 Axios 的外层对象校验，
        // 业务层依然能靠泛型推导出 HttpResponse
        return res as any;
    },
    (error: any) => {
        // 处理 HTTP 网络层面错误 (如 404, 500, 网络断开)
        let errorMessage = '网络异常，请稍后重试';
        if (error.response) {
            switch (error.response.status) {
                case 404: errorMessage = '请求的资源不存在 (404)'; break;
                case 500: errorMessage = '服务器内部错误 (500)'; break;
                case 401: errorMessage = '未授权，请重新登录 (401)'; clearToken(); router.push('/login'); break;
                case 403: errorMessage = '拒绝访问 (403)'; break;
            }
        } else if (error.message.includes('timeout')) {
            errorMessage = '请求超时，请检查网络环境';
        }

        // silent 请求不弹全局提示，把友好文案挂到错误对象上供调用方展示
        if (error.config?.silent) {
            return Promise.reject(new Error(errorMessage));
        }

        Message.error({
            content: errorMessage,
            duration: 5 * 1000,
        });
        return Promise.reject(error);
    }
);

export default service;
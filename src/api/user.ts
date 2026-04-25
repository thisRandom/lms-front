import request, {type HttpResponse } from '@/utils/request';
import type { UserState } from '@/stores/types';


// 登录接口定义
// 注意：因为我们在响应拦截器中已经做了解包 (直接返回 res)，所以这里的返回类型直接是 HttpResponse
export function login(data: any) {
    return request.post<any, HttpResponse>('/auth/login', data);
}

// 登出接口
export function Logout() {
    return request.post<any, HttpResponse>('/auth/logout', null);
}

//获取用户信息
export function getUserInfo() {
    return request.get<any, HttpResponse>('/auth/current');
}

/**
 * 更改用户信息接口
 * 使用 Partial<UserState> 表示可以只修改部分字段（如只改昵称，不改头像）
 */
export function updateUserInfo(data: Partial<UserState>) {
    // 假设后端接口路径为 /user/update
    return request.put<any, HttpResponse>('/user/update', data);
}
// // 示例：获取需要鉴权的数据 (会自动带上 Token)
// export function getDashboardData() {
//     return request.get<any, HttpResponse>('/admin/dashboard');
// }
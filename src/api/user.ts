import request, {type HttpResponse } from '@/utils/request';
import type { UserState } from '@/stores/types';

// 用户列表查询参数
export interface UserListParams {
  page?: number;
  size?: number;
  realName?: string;
  roleId?: number;
  status?: number;
}

// 用户列表响应数据类型
export interface UserListItem {
  id: number;
  username: string;
  realName: string;
  phone: string;
  roleId: number;
  roleName: string;
  status: number;
  createTime: string;
}

export interface UserListResponse {
  total: number;
  pages: number;
  current: number;
  records: UserListItem[];
}

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

// 用户列表接口
export function getUserList(params: UserListParams) {
    return request.get<any, HttpResponse<UserListResponse>>('/users', { params });
}

// 新增用户接口
export function addUser(data: {
    username: string;
    password: string;
    realName: string;
    phone: string;
    roleId: number;
    status: number;
}) {
    return request.post<any, HttpResponse>('/users', data);
}

// 更新用户状态接口（3.6）
export function updateUserStatus(userId: number, status: number) {
    return request.put<any, HttpResponse>(`/users/${userId}/status`, { status });
}

// 编辑用户接口（3.3）
export function updateUser(userId: number, data: {
    realName: string;
    phone: string;
    roleId?: number;
}) {
    return request.put<any, HttpResponse>(`/users/${userId}`, data);
}

// 删除用户接口（3.4）
export function deleteUser(userId: number) {
    return request.delete<any, HttpResponse>(`/users/${userId}`);
}

// 重置密码接口（3.5）
export function resetPassword(userId: number) {
    return request.put<any, HttpResponse>(`/users/${userId}/reset-password`, {});
}

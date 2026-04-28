export type RoleType = 'ADMIN' | 'DISPATCHER' | 'DRIVER' | 'CUSTOMER' | 'ERROR';

export interface UserState {
    username?: string;
    realName?: string;
    phone?: string;
    role: RoleType; // 核心：存储当前用户的角色
    token?: string;
    expireTime?: number;
    isLoggedIn:boolean;
}
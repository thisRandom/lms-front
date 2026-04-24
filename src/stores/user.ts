import { defineStore } from 'pinia'
import type { UserInfo, RoleCode } from '@/types/permission'

export const useUserStore = defineStore('user', {
  state: (): { userInfo: UserInfo } => ({
    userInfo: {
      id: null,
      username: '',
      realName: '',
      phone: '',
      role: 'ADMIN' as RoleCode,
      roleId: 0,
      roleName: '',
      status: 1,
      permissions: [],
    },
  }),

  getters: {
    hasPermission: (state) => (permission: string): boolean => {
      if (state.userInfo.role === 'ADMIN') return true
      return state.userInfo.permissions?.includes(permission) || false
    },
    hasAllPermissions: (state) => (permissions: string[]): boolean => {
      if (state.userInfo.role === 'ADMIN') return true
      return permissions.every((p) => state.userInfo.permissions?.includes(p))
    },
    hasAnyPermission: (state) => (permissions: string[]): boolean => {
      if (state.userInfo.role === 'ADMIN') return true
      return permissions.some((p) => state.userInfo.permissions?.includes(p))
    },
    hasRole: (state) => (role: RoleCode): boolean => {
      return state.userInfo.role === role
    },
    hasAnyRole: (state) => (roles: RoleCode[]): boolean => {
      return roles.includes(state.userInfo.role)
    },
    permissions: (state): string[] => state.userInfo.permissions || [],
  },

  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
    reset() {
      this.userInfo = {
        id: null,
        username: '',
        realName: '',
        phone: '',
        role: 'ADMIN' as RoleCode,
        roleId: 0,
        roleName: '',
        status: 1,
        permissions: [],
      }
    },
  },
})

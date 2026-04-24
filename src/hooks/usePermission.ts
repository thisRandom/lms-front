import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  return {
    hasPermission: (permission: string) => userStore.hasPermission(permission),
    hasAllPermissions: (permissions: string[]) => userStore.hasAllPermissions(permissions),
    hasAnyPermission: (permissions: string[]) => userStore.hasAnyPermission(permissions),
    hasRole: (role: import('@/types/permission').RoleCode) => userStore.hasRole(role),
    hasAnyRole: (roles: import('@/types/permission').RoleCode[]) => userStore.hasAnyRole(roles),
  }
}

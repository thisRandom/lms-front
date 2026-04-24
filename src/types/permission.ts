export type RoleCode = 'ADMIN' | 'DISPATCHER' | 'DRIVER' | 'CUSTOMER'

export interface UserInfo {
  id: number | null
  username: string
  realName: string
  phone: string
  role: RoleCode
  roleId: number
  roleName: string
  status: number
  permissions: string[]
}

export interface MenuItem {
  key: string
  title: string
  icon?: string
  path?: string
  permissions: string[]
  children?: MenuItem[]
}

export interface PermissionCheck {
  hasPermission: (permission: string) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasRole: (role: RoleCode) => boolean
  hasAnyRole: (roles: RoleCode[]) => boolean
}

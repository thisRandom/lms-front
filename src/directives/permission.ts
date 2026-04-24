import type { App, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

export function setupPermissionDirective(app: App) {
  app.directive('permission', {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      const userStore = useUserStore()
      const requiredPermission = binding.value as string
      if (requiredPermission && !userStore.hasPermission(requiredPermission)) {
        el.style.display = 'none'
      }
    },
    updated(el: HTMLElement, binding: DirectiveBinding) {
      const userStore = useUserStore()
      const requiredPermission = binding.value as string
      if (requiredPermission && !userStore.hasPermission(requiredPermission)) {
        el.style.display = 'none'
      } else {
        el.style.display = ''
      }
    },
  })
}

import type { Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '@/stores/user';

function hasPermission(roles: string[]): boolean {
  const userStore = useUserStore();
  return roles.includes(userStore.role);
}

const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    if (value && Array.isArray(value)) {
      if (!hasPermission(value)) {
        el.style.display = 'none';
      }
    } else {
      throw new Error('v-permission requires an array of roles');
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    if (value && Array.isArray(value)) {
      el.style.display = hasPermission(value) ? '' : 'none';
    }
  },
};

export default permission;

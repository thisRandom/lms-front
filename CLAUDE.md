# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vue 3 + TypeScript frontend using [Arco Design Vue](https://arco.design/vue/docs) as the component library, with Vite, Pinia, and Vue Router. This is the admin panel for a logistics management system (LMS).

## Commands

```sh
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Type-check, compile and minify for production
npm run build

# Type-check only (run before every commit)
npm run type-check

# Preview production build locally
npm run preview
```

## Type Check Requirement

**Run `npm run type-check` after every code modification to catch type errors before testing or committing.**

## Architecture

### UI Framework
Arco Design Vue is registered globally with component prefix `arco`. Components are used as `<arco-button>`, `<arco-table>`, etc. The CSS is imported via `@arco-design/web-vue/dist/arco.css`.

### Entry Point
`src/main.ts` bootstraps the app, registers `ArcoVue` with prefix, `Pinia`, `Vue Router`, and the `v-permission` directive.

### Router
`src/router/index.ts` - Vue Router config with route guards and layout system.

Route meta fields:
- `requiresAuth` - whether the route needs login authentication
- `locale` - menu display name
- `icon` - menu icon
- `permissions` - required permissions array (e.g. `['user:view']`)
- `roles` - accessible roles array (e.g. `['ADMIN', 'DISPATCHER']`)

Route patterns:
- `/login` - public login page
- `/dashboard` - layout route with children (all require auth)
- `/:pathMatch(.*)*` - catch-all redirects to `/login`

Login guard: redirect to `/login` if `requiresAuth: true` and no token in localStorage.

### Permission System
`src/types/permission.ts` - Type definitions (UserInfo, RoleCode, MenuItem)
`src/stores/user.ts` - User state store with permission getters (hasPermission, hasAnyPermission, hasRole)
`src/hooks/usePermission.ts` - Composition function for permission checks
`src/directives/permission.ts` - `v-permission` directive to hide elements

Role codes: `ADMIN`, `DISPATCHER`, `DRIVER`, `CUSTOMER`

Permission format: `module:action` (e.g. `user:view`, `order:add`, `vehicle:edit`)

### Views
`src/views/` - page components:
- `login/` - login page
- `dashboard/` - dashboard home page
- `user/` - user management (ADMIN only)
- `vehicle/` - vehicle management
- `order/` - order management
- `dispatch/` - dispatch management
- `location/` - location tracking
- `settings/` - personal settings (all roles)

### Layouts
`src/layouts/default.vue` - main layout with Arco-styled sidebar menu and header. Menu items are filtered by user role.

### Stores
`src/stores/user.ts` - user state store (replaces placeholder counter.ts)

### Alias
`@` resolves to `src/`, so imports can use `@/stores/`, `@/router/`, etc.

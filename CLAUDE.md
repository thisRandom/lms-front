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
`src/router/permission.ts` - Permission guard handling authentication and RBAC.

Route meta fields:
- `requiresAuth` - whether the route needs login authentication
- `locale` - menu display name
- `icon` - menu icon
- `roles` - accessible roles array (e.g. `['admin', 'manager']`) or `['*']` for all roles

Route patterns:
- `/login` - public login page
- `/dashboard` - layout route with children (all require auth)
- `/404` - error page
- `/:pathMatch(.*)*` - catch-all redirects to `/404`

Login guard: redirect to `/login` if `requiresAuth: true` and no token in localStorage. Handles token refresh on page reload.

### Permission System
`src/stores/types.ts` - Type definitions (UserState, RoleType)
`src/stores/user.ts` - User state store with login/logout actions and fetchUserInfo
`src/utils/auth.ts` - Token management (getToken, setToken, clearToken, isLogin)

Role codes: `ADMIN`, `DISPATCHER`, `DRIVER`, `CUSTOMER`, `ERROR` (defined in `stores/types.ts`)

### API Layer
`src/utils/request.ts` - Axios instance with interceptors, handles Bearer token injection and error responses
`src/api/user.ts` - User API calls (login, logout, getUserInfo, updateUserInfo)

Backend proxy: `/api` requests are proxied to `http://10.17.4.55:8090` (configured in vite.config.ts)

### Views
`src/views/` - page components (flat structure, not subdirectories):
- `loginView.vue` - login page
- `dashboard.vue` - dashboard home page
- `userManage.vue` - user management
- `vehicleManage.vue` - vehicle management
- `orderManage.vue` - order management
- `dispatchManage.vue` - dispatch management
- `locationManage.vue` - location tracking
- `userSetting.vue` - personal settings (all roles)
- `error/404.vue` - 404 error page

### Layouts
`src/layouts/default.vue` - main layout with Arco-styled sidebar menu and header. Menu items are filtered by user role.

### Stores
`src/stores/user.ts` - user state store with role-based access
`src/stores/types.ts` - TypeScript types for user state

### Alias
`@` resolves to `src/`, so imports can use `@/stores/`, `@/router/`, etc.

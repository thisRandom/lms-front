# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vue 3 frontend application using [Arco Design Vue](https://arco.design/vue/docs) as the component library. The project uses Vite, TypeScript, Pinia for state management, and Vue Router for routing.

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
```

## Type Check Requirement

**Run `npm run type-check` after every code modification to catch type errors before testing or committing.**

# Preview production build locally
npm run preview
```

## Architecture

### UI Framework
Arco Design Vue is registered globally with component prefix `arco`. Components are used as `<arco-button>`, `<arco-table>`, etc. The CSS is imported via `@arco-design/web-vue/dist/arco.css`.

### Entry Point
`src/main.ts` bootstraps the app, registers `ArcoVue` with prefix, `Pinia`, and `Vue Router`.

### Router
`src/router/index.ts` - Vue Router config with route guards and layout system.

Route meta fields:
- `requiresAuth` - whether the route needs login authentication
- `locale` - menu display name
- `icon` - menu icon
- `roles` - accessible roles (e.g. `['admin']`)

Route patterns:
- `/login` - public login page
- `/dashboard` - layout route with children
- `/:pathMatch(.*)*` - catch-all redirects to `/login`

Login guard: redirect to `/login` if `requiresAuth: true` and not authenticated.

### Views
`src/views/` - page components:
- `login/` - login page
- `dashboard/` - dashboard page

### Layouts
`src/layouts/default.vue` - main layout with sidebar menu and header.

### Stores
`src/stores/` - Pinia stores directory (currently has a counter store placeholder).

### Alias
`@` resolves to `src/`, so imports can use `@/stores/`, `@/router/`, etc.

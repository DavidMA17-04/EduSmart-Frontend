# Layout administrativo — EduSmart Frontend

Documentación de estructura del layout (PBI-01 #7). El dashboard se documenta aparte en [`frontend/src/pages/admin-home/README.md`](../frontend/src/pages/admin-home/README.md).

## Piezas principales

| Pieza | Ruta |
|-------|------|
| Shell (sidebar + navbar + outlet) | `frontend/src/widgets/app-shell/ui/AdminShell.tsx` |
| Estilos del shell | `frontend/src/widgets/app-shell/ui/AdminShell.module.css` |
| Router admin + auth | `frontend/src/app/router/AppRouter.tsx` |
| Guard de sesión | `frontend/src/app/router/RequireAuth.tsx` |
| Redirect raíz | `frontend/src/app/router/RootRedirect.tsx` |
| Tokens de color MEP | `frontend/src/app/styles/admin-theme.css` |

```
┌──────────────────────────────────────────────────────────┐
│ AdminShell                                               │
│  ┌─────────────┐  ┌────────────────────────────────────┐ │
│  │ Sidebar     │  │ Header (notif / perfil / logout)   │ │
│  │ Brand MEP   │  ├────────────────────────────────────┤ │
│  │ NavLinks    │  │ <Outlet />  (página activa)         │ │
│  │ Account     │  │ [Regresar al Dashboard] si aplica  │ │
│  └─────────────┘  └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Comportamiento del shell

- **Sidebar:** navegación por `NavLink`. `end={true}` en `/admin` para que Dashboard no quede activo en subrutas.
- **Navbar:** notificaciones (UI), perfil de sesión (`getSessionUser`), **Cerrar sesión** → `authApi.logout()` + `/login`.
- **Contenido:** `<Outlet />` renderiza la ruta hija.
- **Volver:** en rutas distintas de `/admin` y `/admin/dashboard`, botón “Regresar al Dashboard Administrativo”.

## Auth

1. Rutas bajo `/admin` están envueltas en `<RequireAuth />`.
2. Sin JWT en sesión → redirect a `/login`.
3. `/` y rutas desconocidas usan `RootRedirect` (login o admin según sesión).

## Paleta MEP (`admin-theme.css`)

| Token | Uso típico | Hex |
|-------|------------|-----|
| `--admin-primary` | CTAs / activos | `#002E7A` |
| `--admin-primary-hover` | Hover | `#164687` |
| `--admin-sidebar` | Fondo sidebar | `#021A53` |
| `--admin-accent` | Acento oro | `#CFAC65` |
| `--admin-background` | Fondo app | `#F5F6F8` |
| `--admin-border` | Bordes | `#C1C5C8` |

## Rutas admin actuales

| Ruta | Página |
|------|--------|
| `/admin` | `AdminHomePage` (dashboard) |
| `/admin/dashboard` | `AdminHomePage` |
| `/admin/users` | Selección método incorporación |
| `/admin/users/directory` | Directorio + filtros/paginación |
| `/admin/users/new` | Alta de usuario |
| `/admin/users/:userId` | Ficha / edición |
| `/admin/users/import/bulk` | Carga masiva |
| `/admin/users/import/preview` | Preview import |
| `/admin/users/import-result/:jobId` | Resultado import |
| `/admin/roles-permissions` | Roles y permisos |
| `/admin/specialties` | Especialidades |
| `/admin/academic-periods` | Períodos académicos |
| `/admin/sections-groups` | Niveles y secciones |

**Nota:** no hay ruta `/admin/settings`. El ítem de menú “Configuración” se eliminó hasta existir una pantalla real.

## Responsive

- Shell: colapso hacia iconos ~`840px` (`AdminShell.module.css`).
- Dashboard: breakpoints `1100` / `840` / `520` (`AdminHomePage.module.css`).
- Directorio: ~`720px` (página + filtros).

## Evidencia de pruebas de navegación

Validación manual de navegación (login, sidebar, logout, redirect sin sesión) según criterio del equipo / Azure.

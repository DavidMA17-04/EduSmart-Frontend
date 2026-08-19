# Documentación Sprint 1 — Módulo Administrativo (EduSmart)

Este documento resume el trabajo realizado en el **Sprint 1** del módulo administrativo de EduSmart, cubriendo backend (NestJS) y frontend (React + Vite). Incluye infraestructura, endpoints de API, rutas de la aplicación y la ubicación del código en ambos repositorios.

---

## 1. Resumen general

| Área | Estado | Descripción |
|------|--------|-------------|
| **Backend — Infraestructura** | ✅ Completado | Migración de MSSQL a MySQL, Docker, TypeORM |
| **PBI-09 — Roles y permisos** | ✅ Backend + Frontend | CRUD roles, listado permisos, asignación M:N |
| **PBI-10 — Especialidades** | ✅ Backend + Frontend | CRUD especialidades con inactivación lógica |
| **PBI-11 — Secciones y grupos** | ⚠️ Parcial | Backend completo; frontend con features listas, UI pendiente |
| **WF-19 — Roles y permisos (UI)** | ✅ Completado | Pantalla funcional conectada al API |
| **WF-20 — Especialidades (UI)** | ✅ Completado | Pantalla funcional conectada al API |
| **WF-21 — Secciones y grupos (UI)** | 🔄 En progreso | APIs y formularios; falta widget, página y ruta |

---

## 2. Repositorios y entorno local

| Componente | Ruta | Puerto / URL |
|------------|------|--------------|
| **Frontend** | `C:\Users\Usuario-pc\Projects\EduSmart-Frontend\frontend` | `http://127.0.0.1:5173` |
| **Backend** | `C:\Users\Usuario-pc\Projects\EduSmart-Backend` | `http://localhost:3000` |
| **API base** | — | `http://localhost:3000/api/v1` |
| **Swagger** | — | `http://localhost:3000/api/docs` |
| **MySQL (Docker)** | `compose.yml` en backend | Host `3307` → contenedor `3306` |

### Comandos para levantar el entorno

```powershell
# MySQL (desde EduSmart-Backend)
docker compose up -d mysql

# Backend
cd C:\Users\Usuario-pc\Projects\EduSmart-Backend
npm run start:dev

# Frontend
cd C:\Users\Usuario-pc\Projects\EduSmart-Frontend\frontend
npm run dev
```

### Variables relevantes (backend `.env`)

```
DB_HOST=localhost
DB_PORT=3307
DB_DATABASE=EduSmart
DB_USERNAME=root
DB_PASSWORD=changeme
```

---

## 3. Backend — Cambios de infraestructura

### 3.1 Migración MSSQL → MySQL

- Driver `mysql2` instalado; dependencia `mssql` eliminada.
- `DatabaseModule` configurado con `type: 'mysql'`.
- `synchronize: true` solo fuera de producción (creación automática de tablas en desarrollo).
- Tipos legacy ajustados en entidades:
  - `nvarchar` → `varchar`
  - `uniqueidentifier` → `char(36)` (UUIDs)

### 3.2 Docker MySQL

Archivo: `EduSmart-Backend/compose.yml`

- Imagen: `mysql:8.4`
- Contenedor: `edusmart-mysql`
- Base de datos: `EduSmart`
- Puerto expuesto en host: **3307** (evita conflicto con MySQL local en 3306)

### 3.3 Formato de respuesta API

Todos los endpoints administrativos del sprint responden con un sobre estándar:

```json
{
  "success": true,
  "data": { ... }
}
```

El cliente HTTP del frontend (`src/shared/api/httpClient.ts`) apunta a `http://localhost:3000/api/v1` y extrae el campo `data`.

---

## 4. Backend — Endpoints de API

Prefijo global: **`/api/v1`**

### 4.1 Roles (`/api/v1/roles`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/roles` | Crear rol |
| `GET` | `/roles` | Listar roles |
| `GET` | `/roles/:id` | Obtener rol por ID |
| `PUT` | `/roles/:id` | Actualizar rol |
| `DELETE` | `/roles/:id` | Inactivar rol (baja lógica) |
| `PUT` | `/roles/:id/permissions` | Asignar permisos al rol |

**Controlador:** `src/modules/administrative/roles/controllers/roles.controller.ts`

**Entidad principal:** `RoleEntity` — campos: `code`, `name`, `description`, `status`, relación M:N con permisos.

---

### 4.2 Permisos (`/api/v1/permissions`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/permissions` | Crear permiso |
| `GET` | `/permissions` | Listar permisos |
| `GET` | `/permissions/:id` | Obtener permiso por ID |
| `PUT` | `/permissions/:id` | Actualizar permiso |
| `DELETE` | `/permissions/:id` | Eliminar permiso |

**Controlador:** `src/modules/administrative/permissions/controllers/permissions.controller.ts`

**Enums:** `PermissionModule`, `PermissionAction` — cada permiso pertenece a un módulo y acción.

---

### 4.3 Especialidades (`/api/v1/specialties`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/specialties` | Crear especialidad |
| `GET` | `/specialties` | Listar especialidades |
| `GET` | `/specialties/:id` | Obtener especialidad por ID |
| `PUT` | `/specialties/:id` | Actualizar especialidad |
| `DELETE` | `/specialties/:id` | Inactivar especialidad (baja lógica) |

**Controlador:** `src/modules/administrative/specialties/controllers/specialties.controller.ts`

**Entidad:** `SpecialtyEntity` — campos: `code`, `name`, `area`, `description`, `duration` (períodos académicos, no años), `status`.

---

### 4.4 Secciones (`/api/v1/sections`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/sections` | Crear sección |
| `GET` | `/sections` | Listar secciones |
| `GET` | `/sections/:id` | Obtener sección por ID |
| `PUT` | `/sections/:id` | Actualizar sección |
| `DELETE` | `/sections/:id` | Inactivar sección |

**Controlador:** `src/modules/administrative/sections/controllers/sections.controller.ts`

**Entidad:** `SectionEntity` — vinculada a una especialidad y período académico.

---

### 4.5 Grupos (`/api/v1/groups`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/groups` | Crear grupo |
| `GET` | `/groups` | Listar grupos |
| `GET` | `/groups/:id` | Obtener grupo por ID |
| `PUT` | `/groups/:id` | Actualizar grupo |
| `PUT` | `/groups/:id/guide-teacher` | Asignar o cambiar docente guía |
| `DELETE` | `/groups/:id` | Eliminar grupo |

**Controlador:** `src/modules/administrative/sections/controllers/groups.controller.ts`

**Entidad:** `GroupEntity` — pertenece a una sección (relación 1:N); docente guía opcional (`guideTeacherId`).

---

### 4.6 Otros endpoints existentes (no implementados en frontend del sprint)

| Recurso | Ruta base | Notas |
|---------|-----------|-------|
| Usuarios | `/api/v1/users` | `GET` — pendiente de usar en WF-21 |
| Períodos académicos | `/api/v1/academic-periods` | `GET` |
| Auth | `/api/v1/auth/*` | login, logout, refresh, etc. |
| Health | `/api/v1/health` | Estado del servicio |

---

## 5. Frontend — Rutas de la aplicación

Archivo de rutas: `src/app/router/AppRouter.tsx`

| Ruta | Página | Estado |
|------|--------|--------|
| `/` | Redirige a `/onboarding` | ✅ |
| `/onboarding` | `UserOnboardingPage` — alta de usuarios (existente) | ✅ |
| `/administrative` | `AdminHomePage` — dashboard admin | ✅ |
| `/administrative/roles-permissions` | `RolesPermissionsPage` — WF-19 | ✅ |
| `/administrative/specialties` | `SpecialtiesPage` — WF-20 | ✅ |
| `/administrative/sections-groups` | — | ❌ Pendiente (WF-21) |
| `/administrative/settings` | Enlace en sidebar, sin página dedicada | ❌ |

### Navegación lateral (AdminShell)

Archivo: `src/widgets/app-shell/ui/AdminShell.tsx`

| Ítem del menú | Ruta destino |
|---------------|--------------|
| Dashboard | `/administrative` |
| Usuarios | `/onboarding` |
| Roles y permisos | `/administrative/roles-permissions` |
| Estructura académica | `/administrative/specialties` |
| Configuración | `/administrative/settings` |

> **Nota:** Cuando se complete WF-21, conviene agregar un ítem o sub-ruta para **Secciones y grupos** (`/administrative/sections-groups`).

---

## 6. Frontend — Clientes API (mapeo a backend)

Todos los paths son relativos a `http://localhost:3000/api/v1`.

### 6.1 Roles

**Archivo:** `src/features/manage-role/api/roleApi.ts`

| Función | Método | Path |
|---------|--------|------|
| `list()` | GET | `/roles` |
| `getById(id)` | GET | `/roles/:id` |
| `create(payload)` | POST | `/roles` |
| `update(id, payload)` | PUT | `/roles/:id` |
| `deactivate(id)` | DELETE | `/roles/:id` |

### 6.2 Permisos y asignación a roles

**Archivo:** `src/features/manage-role-permissions/api/permissionApi.ts`

| Función | Método | Path |
|---------|--------|------|
| `list()` | GET | `/permissions` |
| `assignToRole(roleId, permissionIds)` | PUT | `/roles/:roleId/permissions` |

### 6.3 Especialidades

**Archivo:** `src/features/manage-specialty/api/specialtyApi.ts`

| Función | Método | Path |
|---------|--------|------|
| `list()` | GET | `/specialties` |
| `getById(id)` | GET | `/specialties/:id` |
| `create(payload)` | POST | `/specialties` |
| `update(id, payload)` | PUT | `/specialties/:id` |
| `deactivate(id)` | DELETE | `/specialties/:id` |

### 6.4 Secciones

**Archivo:** `src/features/manage-section/api/sectionApi.ts`

| Función | Método | Path |
|---------|--------|------|
| `list()` | GET | `/sections` |
| `getById(id)` | GET | `/sections/:id` |
| `create(payload)` | POST | `/sections` |
| `update(id, payload)` | PUT | `/sections/:id` |
| `deactivate(id)` | DELETE | `/sections/:id` |

### 6.5 Grupos

**Archivo:** `src/features/manage-group/api/groupApi.ts`

| Función | Método | Path |
|---------|--------|------|
| `list()` | GET | `/groups` |
| `getById(id)` | GET | `/groups/:id` |
| `create(payload)` | POST | `/groups` |
| `update(id, payload)` | PUT | `/groups/:id` |
| `assignGuideTeacher(id, payload)` | PUT | `/groups/:id/guide-teacher` |
| `remove(id)` | DELETE | `/groups/:id` |

---

## 7. Frontend — Estructura de código (Feature-Sliced Design)

### 7.1 WF-19 — Roles y permisos ✅

```
src/
├── entities/
│   ├── role/          # Tipos Role, CreateRolePayload, etc.
│   └── permission/    # Tipos Permission
├── features/
│   ├── manage-role/           # CRUD roles + hooks + RoleForm
│   └── manage-role-permissions/  # Asignación permisos + permissionApi
├── widgets/
│   └── roles-permissions-panel/  # Panel principal de la pantalla
└── pages/
    └── roles-permissions/        # RolesPermissionsPage
```

### 7.2 WF-20 — Especialidades ✅

```
src/
├── entities/
│   └── specialty/     # Tipos Specialty, payloads
├── features/
│   └── manage-specialty/   # CRUD + hooks + SpecialtyForm
├── widgets/
│   └── specialties-panel/  # Panel principal
└── pages/
    └── specialties/        # SpecialtiesPage
```

### 7.3 WF-21 — Secciones y grupos 🔄

```
src/
├── entities/
│   ├── section/       # Tipos Section
│   └── group/         # Tipos AcademicGroup, AssignGuideTeacherPayload
├── features/
│   ├── manage-section/    # CRUD secciones + SectionForm ✅
│   └── manage-group/      # CRUD grupos + GroupForm + mock docentes ✅
│       └── model/mockGuideTeachers.ts   # UUIDs temporales de docentes guía
├── widgets/
│   └── sections-groups-panel/   # ❌ Pendiente
└── pages/
    └── sections-groups/         # ❌ Pendiente
```

### 7.4 Infraestructura compartida

```
src/
├── app/
│   ├── router/AppRouter.tsx     # Definición de rutas
│   └── providers/               # Providers globales
├── shared/
│   ├── api/httpClient.ts        # Cliente fetch → /api/v1
│   └── ui/                      # Button, Input, Modal, Table, etc.
└── widgets/
    └── app-shell/               # AdminShell (layout + sidebar)
```

---

## 8. Decisiones técnicas relevantes

| Tema | Decisión |
|------|----------|
| **Duración de especialidades** | Se expresa en **períodos académicos**, alineado al backend |
| **Inactivación vs eliminación** | Roles, especialidades y secciones usan **baja lógica** (`DELETE` → status inactivo) |
| **Docentes guía (WF-21)** | Lista temporal en `mockGuideTeachers.ts` hasta que `GET /users` esté integrado en UI |
| **Puerto Vite** | **5173** (antes 3000, que chocaba con el backend) |
| **Puerto MySQL Docker** | **3307** en host (3306 ocupado localmente) |
| **Arquitectura frontend** | Feature-Sliced Design (entities → features → widgets → pages) |

---

## 9. Pendientes del sprint

1. **WF-21 — UI de secciones y grupos**
   - Crear widget `sections-groups-panel`
   - Crear página `pages/sections-groups`
   - Registrar ruta `/administrative/sections-groups` en `AppRouter.tsx`
   - Agregar enlace en `AdminShell` sidebar

2. **Integración docentes guía**
   - Reemplazar `MOCK_GUIDE_TEACHERS` por datos reales de `GET /api/v1/users`

3. **Producción (futuro)**
   - Migraciones TypeORM formales (reemplazar `synchronize` en prod)
   - Seeds de datos iniciales (roles, permisos, períodos)

---

## 10. Diagrama de flujo — Frontend ↔ Backend

```
┌─────────────────────────────────────────────────────────────┐
│  Navegador  http://127.0.0.1:5173                           │
├─────────────────────────────────────────────────────────────┤
│  AppRouter                                                  │
│    /administrative/roles-permissions  → RolesPermissionsPage│
│    /administrative/specialties        → SpecialtiesPage     │
│    /administrative/sections-groups    → (pendiente)          │
├─────────────────────────────────────────────────────────────┤
│  Features (roleApi, specialtyApi, sectionApi, groupApi)     │
│         ↓ httpClient                                        │
│  http://localhost:3000/api/v1/{resource}                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  NestJS Backend  :3000                                      │
│    /api/v1/roles          /api/v1/permissions               │
│    /api/v1/specialties    /api/v1/sections                  │
│    /api/v1/groups                                           │
│         ↓ TypeORM                                           │
│  MySQL (Docker)  localhost:3307  →  EduSmart                │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Verificación

```powershell
# Type-check y build frontend
cd C:\Users\Usuario-pc\Projects\EduSmart-Frontend\frontend
npm run type-check
npm run build

# Probar API manualmente (con backend corriendo)
curl http://localhost:3000/api/v1/roles
curl http://localhost:3000/api/v1/specialties
curl http://localhost:3000/api/v1/sections
curl http://localhost:3000/api/v1/groups
```

---

*Documento generado el 17 de agosto de 2026 — Sprint 1, Módulo Administrativo EduSmart.*

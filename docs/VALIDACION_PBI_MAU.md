# Validación manual — PBI-01 / PBI-02 / PBI-03 (Mauricio)

**Propósito:** evidencia versionada para cerrar en Azure los ítems de “pruebas / validar” sin suite E2E.

| Campo | Valor |
|-------|--------|
| Fecha de ejecución | 2026-09-04 |
| Rama | `Feature-Mau` → `Development` |
| Entorno | Local (Docker MySQL + Nest + Vite) |
| Credenciales admin | `admin@ctphojancha.ed.cr` / ver `backend/.env` → `ADMIN_PASSWORD` |
| Ejecutado por | Mauricio Chavarria |

### Smoke API ejecutado (2026-09-04)

| Check | Resultado |
|-------|-----------|
| `GET /api/v1/health` | Pass — `{"status":"ok"}` |
| `POST /api/v1/auth/login` | Pass — JWT emitido |
| `GET /api/v1/dashboard/summary` | Pass — p.ej. totalUsers=503, activeUsers=381, roles=3, specialties=5, usersByRole Admin/Docente/Estudiante |
| `GET /api/v1/users` | Pass — 503 usuarios |

UI checklist (navegación / chips / paginación): marcar en tablas siguientes al hacer el click-through local.

**Precondiciones**

```powershell
cd C:\EduSmart\backend
docker compose up -d
npm run start:dev

cd C:\EduSmart\frontend\frontend
npm run dev
```

Abrir la URL que imprima Vite (p. ej. `http://localhost:5173`).

---

## A. Navegación (PBI-01 #6)

| # | Paso | Resultado esperado | OK |
|---|------|--------------------|----|
| A1 | Ir a `/admin` sin sesión | Redirige a `/login` | ☐ |
| A2 | Login con admin | Entra a `/admin` (dashboard) | ☐ |
| A3 | Sidebar: Usuarios | Abre flujo de usuarios | ☐ |
| A4 | Sidebar: Roles y permisos | Abre roles | ☐ |
| A5 | Sidebar: Estructura académica | Abre especialidades | ☐ |
| A6 | Sidebar: Períodos académicos | Abre períodos | ☐ |
| A7 | Sidebar: Niveles y secciones | Abre secciones/grupos | ☐ |
| A8 | Sidebar: Dashboard (activo solo en home) | Vuelve a `/admin`; no queda “activo” en subrutas | ☐ |
| A9 | En página no-dashboard, botón “Regresar al Dashboard Administrativo” | Navega a `/admin` | ☐ |
| A10 | Cerrar sesión | Limpia sesión y vuelve a `/login` | ☐ |
| A11 | No existe ítem “Configuración” en sidebar | Evita link muerto `/admin/settings` | ☐ |

**Resultado sección A:** ☐ Pass · ☐ Fail — Notas: _______________

---

## B. Dashboard / carga de datos (PBI-02 #6)

| # | Paso | Resultado esperado | OK |
|---|------|--------------------|----|
| B1 | Tras login, dashboard muestra “Cargando…” y luego datos | Loading → KPIs | ☐ |
| B2 | Aparecen 6 KPIs (usuarios, activos, roles, períodos, secciones, especialidades) | Valores numéricos visibles | ☐ |
| B3 | Donut “Distribución de usuarios” con leyenda por rol | Colores MEP (Admin oro, Docente/Estudiante azules) | ☐ |
| B4 | Accesos rápidos (sin “Configuración”) | Links a módulos existentes | ☐ |
| B5 | No hay card “Actividad reciente / Próximamente” | Solo donut + quick access | ☐ |
| B6 | API: `GET /api/v1/dashboard/summary` con JWT | HTTP 200 + JSON `data` | ☐ |

Smoke API (opcional, PowerShell autenticado):

```powershell
$body = '{"email":"admin@ctphojancha.ed.cr","password":"Admin1234"}'
$login = Invoke-RestMethod -Uri http://localhost:3000/api/v1/auth/login -Method POST -ContentType "application/json" -Body $body
$token = $login.data.accessToken
if (-not $token) { $token = $login.access_token }
Invoke-RestMethod -Uri http://localhost:3000/api/v1/dashboard/summary -Headers @{ Authorization = "Bearer $token" }
```

**Resultado sección B:** ☐ Pass · ☐ Fail — Notas: _______________

---

## C. Usuarios — filtros y alta (PBI-03 #8)

| # | Paso | Resultado esperado | OK |
|---|------|--------------------|----|
| C1 | Abrir `/admin/users/directory` | Tabla + chips de estado/rol | ☐ |
| C2 | Filtrar por estado (p. ej. Activo) | Lista filtrada; conteos en chips | ☐ |
| C3 | Filtrar por rol (p. ej. Administrador) | Solo usuarios con ese rol | ☐ |
| C4 | Búsqueda opcional por nombre/cédula/correo | Filtra; “Limpiar filtros” restaura | ☐ |
| C5 | Si hay >10 resultados, paginación | Páginas de 10; cambiar página funciona | ☐ |
| C6 | Nuevo usuario con nombre + apellidos | Crea OK (payload `name` / `first_lastname` / `second_lastname`) | ☐ |
| C7 | Ver ficha del usuario creado | `/admin/users/:id` muestra datos | ☐ |

**Resultado sección C:** ☐ Pass · ☐ Fail — Notas: _______________

---

## Firma de evidencia

| Sección | Pass/Fail | Fecha |
|---------|-----------|-------|
| A Navegación | Pendiente UI local | 2026-09-04 |
| B Dashboard | **Pass (API smoke)** — UI local pendiente de tildar | 2026-09-04 |
| C Usuarios | **Pass (API list)** — filtros/paginación UI pendientes de tildar | 2026-09-04 |

**Veredicto global:** Smoke API de dashboard y usuarios **Pass**. Completar tildes UI en secciones A–C y luego marcar Done en Azure ítems 01#6, 02#6, 03#8.

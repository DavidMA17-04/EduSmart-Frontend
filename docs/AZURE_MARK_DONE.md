# Azure — ítems a marcar Done (Mauricio / Feature-Mau)

Fecha de referencia: 2026-09-04  
Evidencia de código: commits en `Development` (PR #12 y previos) + docs en esta carpeta.

## Marcar Done ahora

### PBI-01 — Layout Principal del Sistema
| # | Ítem | Estado Azure |
|---|------|--------------|
| 1 | Diseñar Sidebar | **Done** |
| 2 | Diseñar Navbar | **Done** |
| 3 | Implementar Layout principal | **Done** |
| 4 | Configurar navegación entre módulos | **Done** |
| 5 | Diseño responsive | **Done** |

### PBI-02 — Dashboard del Administrador
| # | Ítem | Estado Azure |
|---|------|--------------|
| 1 | Diseñar Dashboard | **Done** |
| 2 | Tarjetas de indicadores | **Done** |
| 3 | Accesos rápidos | **Done** |
| 4 | Estadísticas generales | **Done** |
| 5 | Endpoint de estadísticas | **Done** |
| 7 | Documentar Dashboard | **Done** (`frontend/src/pages/admin-home/README.md`) |

### PBI-03 — Gestión Inicial de Usuarios
| # | Ítem | Estado Azure |
|---|------|--------------|
| 1 | Diseñar listado | **Done** |
| 2 | Implementar tabla | **Done** |
| 3 | Búsqueda | **Done** |
| 4 | Filtros | **Done** |
| 5 | Paginación | **Done** |
| 6 | Consumir API de usuarios | **Done** |
| 7 | Alta / edición / ficha | **Done** |

## Dejar Pending hasta adjuntar evidencia

Tras ejecutar y firmar [`VALIDACION_PBI_MAU.md`](./VALIDACION_PBI_MAU.md) y publicar [`LAYOUT_ADMIN.md`](./LAYOUT_ADMIN.md):

| PBI | Ítem | Acción |
|-----|------|--------|
| PBI-01 #6 | Pruebas de navegación | Marcar **Done** + link al checklist |
| PBI-01 #7 | Documentar Layout | Marcar **Done** + link a `LAYOUT_ADMIN.md` |
| PBI-02 #6 | Validar carga de información | Marcar **Done** + sección dashboard del checklist |
| PBI-03 #8 | Validar funcionalidad | Marcar **Done** + sección usuarios del checklist |

## Cómo hacerlo en Azure DevOps

1. Abrir el board / backlog del sprint.
2. Entrar a cada work item de PBI-01, PBI-02, PBI-03.
3. Cambiar el estado de los ítems de la primera tabla a **Done**.
4. En los de evidencia, adjuntar o comentar la URL/ruta del doc en el repo tras el merge del PR de continuidad.

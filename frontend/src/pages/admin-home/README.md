# AdminHomePage — Dashboard del Administrador

## Descripción

Página principal del módulo administrativo. Muestra un resumen general del sistema mediante tarjetas KPI, un gráfico de distribución de usuarios por rol, y accesos rápidos a los módulos más utilizados.

## Endpoint consumido

`GET /api/v1/dashboard/summary` (requiere JWT)

Respuesta:

```json
{
  "success": true,
  "data": {
    "totalUsers": 1,
    "activeUsers": 1,
    "totalRoles": 3,
    "totalAcademicPeriods": 1,
    "usersByRole": [
      { "role": "Administrador", "count": 1 }
    ]
  }
}
```

## KPIs mostrados

| Tarjeta | Campo | Icono |
|---------|-------|-------|
| Total Usuarios | `totalUsers` | Users |
| Usuarios Activos | `activeUsers` | UserCheck |
| Roles | `totalRoles` | ShieldCheck |
| Períodos Académicos | `totalAcademicPeriods` | CalendarRange |

## Cómo agregar un nuevo KPI

1. Agregar el campo al DTO del backend (`backend/src/modules/dashboard/dto/dashboard-summary.dto.ts`).
2. Calcular el valor en `DashboardService.getSummary()`.
3. Agregar la interfaz en el frontend (`features/dashboard/api/dashboardApi.ts`).
4. Agregar una nueva `<Card>` en el grid de `AdminHomePage.tsx`.

## Dependencias

- `recharts` — librería de gráficos para el BarChart de usuarios por rol.
- `@/features/dashboard` — API wrapper del endpoint.
- `@/shared/ui` — componente Card reutilizable.
- `@/shared/auth` — `getSessionUser()` para el saludo personalizado.

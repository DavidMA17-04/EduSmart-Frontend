# Centro de apelaciones — Sprint 6

Fachada de consulta y UX sobre el módulo disciplinario de Sprint 4. No es un segundo sistema de apelaciones. El identificador visible sigue siendo el expediente `AM-AAAA-NNNN`.

Origen: backend `Feature-DavidV2B`, frontend `Feature-DavidV2F`; integración vigente en `Feature-Aaron` de ambos repos. Prefijo API: `/api/v1`.

## Arquitectura

- Backend: `backend/src/modules/disciplinary`. Escritura en `DisciplinaryAppealsService`. Lectura en `DisciplinaryAppealQueryService` (`appeal-query.ts`, `appeal-reports.ts`, `appeal-tracking.ts`).
- Frontend FSD: tipos y cliente en `entities/discipline`; paneles en `features/manage-discipline`; páginas delgadas en `pages/discipline`.
- El stub `src/modules/appeals` (`/appeals`, 501) no se usa. `tsconfig.build.json` excluye `disciplinary.service.ts` heredado.
- Sin migraciones nuevas. El esquema vigente es 025–027 (catálogo, calendario, roles `disciplinary.*`).

## Endpoints del Centro

| Método y ruta | Guardia | Qué hace |
|---|---|---|
| `GET /disciplinary/appeals` | alcance `view` / `view_own` | Listado paginado y filtrable |
| `GET /disciplinary/appeals/eligible` | alcance | Expedientes donde el actor puede interponer ahora |
| `GET /disciplinary/appeals/review` | alcance de resolución | Bandeja de pendientes de la instancia |
| `GET /disciplinary/appeals/review/:id` | alcance de resolución | Detalle para resolver |
| `GET /disciplinary/appeals/dashboard` | `disciplinary.view` | Indicadores de recursos |
| `GET /disciplinary/appeals/:id` | alcance | Seguimiento y cronología |
| `POST /disciplinary/cases/:id/revocations` | Sprint 4 | Interponer revocatoria |
| `POST /disciplinary/cases/:id/appeals` | Sprint 4 | Interponer apelación post-rechazo |
| `POST /disciplinary/cases/:id/revocations/:appealId/resolution` | `disciplinary.resolve` | Acoge / Rechaza |
| `POST /disciplinary/cases/:id/appeals/:appealId/resolution` | `disciplinary.appeal` | Acoge / Rechaza / Acoge parcialmente |
| `GET /disciplinary/appeals/export/excel` | `disciplinary.export` | Excel de recursos |
| `GET /disciplinary/appeals/export/pdf` | `disciplinary.export` | PDF administrativo de recursos |
| `POST /disciplinary/notifications/:id/read` | encargado de esa notificación | Confirma lectura; no altera una fecha ya guardada |

Filtros de listado/dashboard/export: `kind`, `outcome`, `caseId`, `studentUserId`, `deadline`, `page`, `pageSize`.

## Rutas frontend

No existe `/admin/appeals`. Las rutas se componen dentro de la casa del autenticado: `/admin`, `/teacher`, `/counselor`, `/director`, `/student` o `/guardian`. En la tabla, `<casa>` representa ese prefijo. Revisión/reportes son de personal autorizado; alumnos y encargados solo consultan recursos y expedientes propios o vinculados. Las URLs antiguas de `/admin` redirigen al equivalente permitido conservando ids, consulta y fragmento:

| Ruta | Quién entra |
|---|---|
| `<casa>/discipline/appeals` | `view` o `view_own` |
| `<casa>/discipline/appeals/new` | igual |
| `<casa>/discipline/appeals/:appealId` | igual |
| `<casa>/discipline/appeals/review` | `resolve` o `appeal` (staff) |
| `<casa>/discipline/appeals/reports` | `disciplinary.view` (staff) |
| `<casa>/discipline/cases/:caseId` | `view` o `view_own`; el servicio limita el expediente |

El `AM-` del listado abre el seguimiento. “Expediente” y el número en el detalle abren el caso. En el expediente, cada recurso enlaza al seguimiento.

## Roles y permisos

No se crearon permisos nuevos.

| Actor | Menú Centro | Revisión | Reportes | Export | Notas |
|---|---|---|---|---|---|
| Administrador | sí si tiene `view` | sí si `resolve`/`appeal` | sí si `view` | sí si `export` | El servicio decide el alcance |
| Dirección | sí | apelaciones | sí | sí | No registra amonestación |
| Orientación | sí | no (sin resolve/appeal) | sí | sí | Ve tablero institucional |
| Docente guía | sí (`view_own`) | sus revocatorias si `resolve` | no | no | No ve dashboard de recursos |
| Encargado | sí | no | no | no | Listado e historial de su representado |
| Estudiante | sí (`view_own`) | no | no | no | No ve catálogo ni registro |

Ocultar un botón no autoriza la operación: dashboard y export exigen permiso en el controlador; listados aplican `caseScopeClause`.

## Flujo del recurso

1. El actor abre el Centro y elige un expediente elegible.
2. Escribe el fundamento. En revocatoria puede marcar subsidio.
3. Confirma una sola vez. El cliente llama al POST de Sprint 4.
4. El recurso aparece en el listado y, si corresponde, en la bandeja.
5. Quien dictó el acto resuelve la revocatoria; Dirección resuelve la apelación.
6. Se emite `CommunicationKind.APPEAL_RESOLUTION`. Abrir el Centro no marca lectura.
7. El encargado confirma lectura; una segunda confirmación no cambia la fecha.
8. La nota de conducta solo descuenta rebajos **firmes**: `max(0, 100 − rebajos firmes)`.

## Configuración local

- API en `:3000`, Vite en `127.0.0.1:5173` (proxy `/api` → backend).
- MySQL del contenedor `edusmart-mysql` en el puerto 3307, base `EduSmart`.
- Cuentas DiscQA de prueba del módulo (cédulas de seed, no se documentan contraseñas aquí).
- No modificar la matrícula huérfana detectada ni expedientes firmes ajenos a la prueba aislada.

## Cómo probar

Backend, desde `backend/`:

```
npx tsc --noEmit -p tsconfig.build.json
npx jest src/modules/disciplinary --no-coverage
```

Frontend, desde `frontend/frontend/`:

```
npx tsc --noEmit
npx vitest run src/features/manage-discipline src/widgets/app-shell/model/adminNavigation.test.ts
```

Camino feliz autenticado (ambiente local, expediente **nuevo**):

1. Docente DiscQA registra una falta leve QA de hoy.
2. Encargado DiscQA abre Centro → Nueva apelación → confirma envío.
3. El `AM-` aparece en el listado y abre el seguimiento.
4. El docente ve la revocatoria en Revisión y la resuelve con el formulario de Sprint 4.
5. El encargado ve la notificación, abre el seguimiento (sigue sin leer) y confirma lectura.
6. Dirección abre Reportes, aplica un filtro y exporta Excel/PDF.

Script opcional de QA autenticada: `node scripts/sprint6-centro-qa.mjs` desde `backend/`, con `DISCQA_PASSWORD` en el entorno. No hay contraseña por defecto ni en este documento.

## Limitaciones y decisiones pendientes

- Plazos de guía REAC vs reloj de Sprint 4: se mantiene el código vigente.
- No hay adjuntos en el `body` del recurso, canal oral ni informes a comités.
- No hay fecha de nacimiento usable para mayores de edad.
- El stub `/appeals` permanece fuera de servicio.
- El merge a `Development` y cualquier commit quedan fuera de este documento hasta autorización del Product Owner.

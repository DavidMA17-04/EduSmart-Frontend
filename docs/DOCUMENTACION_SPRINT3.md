# Documentación Sprint 3 — EduSmart (cierre técnico)

**Estado del documento:** cerrado para verificación técnica (S3-02…S3-11).  
**Fecha de alcance aprobado:** 2026-09-25.  
**Última verificación API:** 2026-09-25 (suite `backend/scripts/s3-e2e-suite.mjs`).

## Nota metodológica (alcance reconstruido)

El repositorio **no** contiene un backlog oficial ni documentación histórica con etiqueta `Sprint 3` / `feat(sprint-3)`.

Para el **cierre técnico**, el alcance fue **reconstruido** a partir de evidencia en commits `feat(attendance)` (PBI-27/28/29, WF-38/43/44) y **aprobado explícitamente** (S3-01) como clúster de Asistencia.

Sprint 2 (Auth EP-02, PBI-15, PBI-16) permanece **100% cerrado** y fuera de este documento salvo regresión mínima (S3-T10).

---

## Alcance congelado (S3-02)

### IN SCOPE

| Ítem | Descripción |
|------|-------------|
| Sesiones / roster / redeem | Crear sesión, pasar lista, cerrar, token y canje estudiante |
| **PBI-27** | Justificaciones de ausencia (solicitud, evidencia, revisión) |
| **PBI-28 / WF-38** | Historial de asistencia + permiso `attendance.view_own` |
| **PBI-29** | Alertas y reglas de ausentismo |
| **WF-43/44** | KPIs de asistencia y reportes/export PDF·Excel por rango |

### OUT OF SCOPE

Horarios · excepciones de calendario · años lectivos MEP · students / appeals / disciplinary / communications · reportes administrativos generales · Sprint 1 · Sprint 2 (salvo regresión).

---

## Migraciones relacionadas (asistencia)

| Archivo | Uso en S3 |
|---------|-----------|
| 008–011, 017 | Fundaciones sesiones / records |
| 018–019 | Justificaciones + guardian + JUSTIFIED |
| 022 | `attendance.view_own` (PBI-28) |
| 023 | Tablas ausentismo (PBI-29) |
| 012–016, 020, 021 | Fuera de alcance S3 (horarios / exceptions / MEP) |

**Nota DB:** no existe tabla TypeORM `migrations`; la verificación S3-03 confirma presencia física de tablas (`attendance_sessions`, `attendance`, `absence_justifications`, `justification_evidences`, `absenteeism_*`, `guardian_student_links`) y de los archivos SQL 018/019/022/023.

Fixtures QA (no mocks de producto): `backend/scripts/s3-seed-fixtures.mjs` crea sección/grupo/materia/TA/matrícula mínima (`300000001` Docente, `300000002` Estudiante, password de prueba `TempPass12`).

---

## Decisiones técnicas del cierre

| Tema | Decisión |
|------|----------|
| Historial (`GET /attendance/history*`) | Sin `@Permissions` en controller: `PermissionsGuard` exige ALL; la authz `view` **OR** `view_own` vive en el servicio (intencional). |
| PATCH reglas ausentismo | Controller exige `attendance.edit`; servicio sigue restringiendo a administrador. |
| Redeem token | Acepta rol institucional `Estudiante` vía `isStudentActor` (antes solo `STUDENT`). |
| Justificaciones FE | Gate `attendance.justify` para “Nueva justificación”; revisión solo con `attendance.review` (sin bypass de modo demo). |
| Demo mocks | `VITE_DEMO_JUSTIFICATIONS` debe permanecer unset/`false` en QA. |

---

## Correcciones realizadas en el cierre

| Archivo | Problema | Cambio | Evidencia |
|---------|----------|--------|-----------|
| `backend/.../absenteeism.controller.ts` | PATCH reglas con `attendance.view` | `@Permissions(ATTENDANCE_EDIT)` | S3-T06-update-rule PASS |
| `backend/.../attendance-token.service.ts` | Redeem rechazaba `Estudiante` | Usa `isStudentActor()` | S3-T02-redeem PASS + unit test |
| `frontend/.../attendanceApi.ts` | Sin cliente rules/alerts | `listAbsenteeismRules` / `updateAbsenteeismRule` / `listAbsenteeismAlerts` | Build FE OK |
| `frontend/.../useAbsenteeismAlertsPanel.ts` | Solo dashboard | Carga rules + alerts + updateRule | Compila |
| `frontend/.../AbsenteeismAlertsPanel.tsx` | Criterios solo lectura | UI reglas editables + alertas persistidas | MANUAL REQUIRED |
| `frontend/.../JustificationsInboxPanel.tsx` | Create sin gate; review con mock bypass | `canJustify` + review solo `canReview` | MANUAL REQUIRED |
| `frontend/frontend/.env.example` | Sin nota demo | Documenta `VITE_DEMO_JUSTIFICATIONS` | — |
| `backend/scripts/s3-*.mjs` | Sin suite/seed S3 | Seed + E2E S3-T01…T10 | 28/28 PASS |

---

## Autorización (matriz verificada API)

| Caso | Resultado |
|------|-----------|
| JWT ausente → history | **401** (S3-T09-401) |
| Estudiante sin `attendance.review` → review | **403** (S3-T09-403-review) |
| Actor sin `attendance.justify` → create | **403** (S3-T09-403-justify) |
| Estudiante history `view_own` | **200** (S3-T03-view-own) |

---

## Pruebas automatizadas

### Backend (Jest, módulo asistencia / authz)

- Suites ejecutadas: `attendance-token.service.spec`, `justifications.controller.permissions`, `attendance.controller.permissions`, absenteeism-related → **33/33 PASS**
- Build Nest: **OK**

### Frontend

- Build `tsc && vite build`: **OK**
- Vitest manage-attendance: ver ejecución en cierre

### E2E API Sprint 3 (`node scripts/s3-e2e-suite.mjs`)

**28/28 PASS** (0 FAIL, 0 SKIP) — detalle en sección inferior.

---

## Pruebas funcionales S3-T01…T10 (API ejecutadas)

| ID | Resultado | Notas |
|----|-----------|-------|
| S3-T01 | **PASS** | Sesión + roster + ABSENT |
| S3-T02 | **PASS** | Token + redeem estudiante |
| S3-T03 | **PASS** | Historial + summary + view_own |
| S3-T04 | **PASS** | Create + list justificaciones (demo OFF) |
| S3-T05 | **PASS** | Review APPROVED |
| S3-T06 | **PASS** | List/update reglas |
| S3-T07 | **PASS** | Dashboard + alerts |
| S3-T08 | **PASS** | KPIs + summary + export Excel |
| S3-T09 | **PASS** | 401 / 403 review / 403 justify |
| S3-T10 | **PASS** | Login admin + GET /users (regresión S2) |

---

## Pruebas manuales pendientes (UI navegador)

Sin automatización de browser en este entorno → **no se marcan PASS**.

### M1 — Panel alertas/reglas ausentismo
1. Login admin (`100000000` / `Admin1234`).
2. Ir a **Asistencias → Alertas de ausentismo**.
3. Verificar KPIs, lista de reglas con umbral/activo, alertas persistidas.
4. Como admin, cambiar umbral (blur) y toggle activo; confirmar persistencia tras “Actualizar”.
5. Login docente sin `attendance.edit`: controles deshabilitados / mensaje de solo lectura.

### M2 — Justificaciones con demo OFF
1. Confirmar que `VITE_DEMO_JUSTIFICATIONS` **no** está en `true` (reiniciar Vite si se cambia).
2. Login estudiante `300000002` / `TempPass12` → debe ver **Nueva justificación** (tiene `attendance.justify`).
3. Login docente sin justify → **no** debe ver el botón crear; sí puede revisar si tiene `attendance.review`.
4. Crear justificación real contra ausencia ABSENT; revisar como docente/admin.
5. Confirmar que **no** aparece chip “Modo demo (mocks)” ni acciones de revisión sin permiso.

### M3 — Sesión / roster / redeem UI
1. Docente `300000001` / `TempPass12` → Nueva asistencia → grupo S3-10-1 → roster con 1 estudiante.
2. Marcar ausencia, generar token, canjear como estudiante en UI redeem.

---

## Regresión Sprint 2

**PASS** (S3-T10: login + listado usuarios).

---

## Deuda técnica no bloqueante

- Historial sin decorator de permisos (authz en servicio) — documentado y cubierto por tests.
- Estructura académica vacía en DB base; fixtures S3 son necesarias para QA local.
- UI de reglas: `onBlur` guarda umbral (sin formulario batch).
- Export PDF de reportes no cubierto en E2E (Excel sí).

## Fuera de alcance (no tocado)

Horarios, excepciones de calendario, años MEP, students/appeals/disciplinary/communications, reportes administrativos generales, S1/S2 funcionales.

---

## Porcentaje final verificado

| Capa | Estado |
|------|--------|
| Backend API + authz + persistencia | Verificado (E2E 28/28) |
| DB tablas asistencia S3 | Verificado |
| Frontend compile + gates código | Verificado |
| UI navegador (reglas/justificaciones/sesión) | **MANUAL REQUIRED** |

**Sprint 3 verificado (API + código): ~92%**  
**No se declara `SPRINT 3 = 100% VERIFICADO`** mientras M1–M3 estén pendientes en navegador.

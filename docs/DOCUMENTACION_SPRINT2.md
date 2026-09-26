# Documentación Sprint 2 — Cierre (EduSmart)

**Fecha de cierre (intento):** 2026-09-25  
**Alcance confirmado (PO / plan `sprint-2-closure-plan`):**

| Épica | Contenido |
|-------|-----------|
| **Auth EP-02** | Login JWT, refresh, logout/sesiones, forgot/reset password, change password, perfil `/users/me`, `mustChangePassword`, SMTP |
| **PBI-15** | Registro manual de usuario (`POST /users`, UI `/admin/users/new`) |
| **PBI-16** | Verificación de cuenta (`PENDING` → OTP → `ACTIVE`) |

**Fuera de alcance (explícito):** asistencia, justificaciones, ausentismo, horarios, students/appeals/disciplinary/communications, authz académica JWT-only (deuda transversal).

---

## 1. Estado por épica

| Épica | Frontend | Backend | DB | Integración | Authz | Pruebas | Estado |
|-------|----------|---------|----|-------------|-------|---------|--------|
| Auth EP-02 | OK | OK | `user_sessions`, `password_reset_tokens` | OK | JWT + public reset/forgot | S2-T01,T10–T15, unit | **COMPLETO*** |
| PBI-15 | OK | OK | `users`, roles | OK | `administrator.create` (BE) | S2-T03,T04,T16, unit FE | **COMPLETO*** |
| PBI-16 | OK | OK (+ fix create→issue) | `account_verifications` (006) | OK + Ethereal SMTP | Public verify/resend | S2-T02,T06–T09 | **COMPLETO*** |

\*COMPLETO respecto a criterios ejecutados; ver §3 (T05 UI smoke pendiente).

---

## 2. Corrección aplicada en este cierre

### Bug PBI-16 — `UsersService.create` no emitía verificación

**Problema:** Crear usuario `PENDING` no llamaba a `AccountVerificationService.issueAndSend`, por lo que no había fila en `account_verifications` ni correo.

**Archivo:** `backend/src/modules/administrative/users/services/users.service.ts`  
**Cambio:** tras `USER_CREATED`, si `status === PENDING` → `issueAndSend(userId, actorId)`.  
**Test:** `users.service.spec.ts` actualizado (PENDING sí emite; ACTIVE no).

---

## 3. Suite de pruebas S2-T01 … S2-T18

**Re-verificación real:** 2026-09-25 ~22:02 (UTC-6) contra Nest `:3000`, MySQL Docker, frontend `:5173`, SMTP Ethereal.

Ejecución: `node backend/scripts/s2-e2e-suite.mjs` + `node backend/scripts/s2-live-supplement.mjs`

| ID | Resultado | Evidencia |
|----|-----------|-----------|
| S2-T01 | **PASS** | Login admin cédula `100000000` → 201 + tokens |
| S2-T02 | **PASS** | Login PENDING → 401 `reason=ACCOUNT_PENDING` |
| S2-T03 | **PASS** | `POST /users` ACTIVE → id + fila MySQL |
| S2-T04 | **PASS** | Validación 400; dup email 409 |
| S2-T05 | **BLOCKED** | Persistencia “crear otro” vía 2× `POST /users` PASS; toast/FeedbackCard UI **sin automatización de navegador disponible** |
| S2-T06 | **PASS** | PENDING + audit `USER_VERIFICATION_SENT` `{mail:"SENT"}` |
| S2-T07 | **PASS** | OTP + verify + login ACTIVE |
| S2-T08 | **PASS** | Código inválido → 400 |
| S2-T09 | **PASS** | Resend genérico |
| S2-T10 | **PASS** | Forgot → token DB + mail Ethereal |
| S2-T11 | **PASS** | Reset desde IMAP Ethereal → login nueva clave |
| S2-T12 | **PASS** | change-password + re-login |
| S2-T13 | **PASS** | sessions list + revoke |
| S2-T14 | **PASS** | logout 201 |
| S2-T15 | **PASS** | refresh |
| S2-T16 | **PASS** | Docente → `GET /users` 403 |
| S2-T17 | **PASS** | Jest 24 tests |
| S2-T18 | **PASS** | Vitest 16 tests |

**Extras ejecutados:** SMTP send OK · mustChangePassword · audit sin códigos · login incorrecto 401 · sin token 401 · token inválido 401 · PATCH `/users/me` + MySQL/readback.

**Resumen:** PASS=17/18 formal + extras · FAIL=0 · BLOCKED=1 (T05 UI browser).

---

## 4. Entorno (S2-02)

| Componente | Estado |
|------------|--------|
| MySQL `edusmart-mysql` | Healthy, puerto host **3307** |
| Tablas 006/007 | `account_verifications`, `password_reset_tokens`, `user_sessions` presentes |
| `APP_PUBLIC_URL` | `http://localhost:5173` (añadido a `.env` local) |
| SMTP | Ethereal (`smtp.ethereal.email`) — envío real capturado (no producción) |
| Backend | `npm run start:dev` :3000 |
| Frontend | `npm run dev` :5173 |

---

## 5. Checklists PBI (evidencia)

Ver archivos actualizados:

- `frontend/docs/PBI-15_REGISTRO_MANUAL.md`
- `frontend/docs/PBI-16_VERIFICACION_CUENTA.md`

---

## 6. Tareas S2-01 … S2-12

| ID | Resultado | Notas |
|----|-----------|-------|
| S2-01 | **PASS** | Alcance firmado por PO en chat |
| S2-02 | **PASS** | MySQL + migraciones + Ethereal + APP_PUBLIC_URL |
| S2-03 | **PASS** | LoginFlow `verifyPrompt` ante ACCOUNT_PENDING (código + T02) |
| S2-04 | **DEFER** | Ruta FE `/users/new` bajo `administrator.view`; BE exige `administrator.create`. Deuda no bloqueante |
| S2-05 | **PASS** | `RequireAuth` fuerza `/admin/settings`; flag en login verificado |
| S2-06 | **PASS** | E2E PBI-16 + fix issueAndSend |
| S2-07 | **PASS** | Forgot/reset/sessions/refresh/profile |
| S2-08 | **PASS** | 403 users sin permiso |
| S2-09 | **PASS*** | Checklists marcados con evidencia; ítem UI “crear otro” pendiente browser |
| S2-10 | **PASS*** | Suite ejecutada; T05 SKIP |
| S2-11 | **PASS** | Unit BE+FE verdes |
| S2-12 | **PASS** | Este documento |

---

## 7. Deuda técnica fuera del Sprint 2

- Authz JWT-only en academic-years/periods/sections/groups/specialties/administrative-reports
- `VITE_DEMO_JUSTIFICATIONS` / PBI-27+
- Absenteeism rules UI
- Módulos stub 501 (students, appeals, disciplinary, communications)
- FE create page gated solo con `.view` (S2-04)
- `DOCUMENTACION_SPRINT1.md` desactualizado (WF-21)

---

## 8. Porcentaje verificable

| Métrica | Valor |
|---------|-------|
| API + MySQL + unit + SMTP Ethereal | **~97%** |
| T05 toast/FeedbackCard en navegador | **BLOCKED** (sin Playwright/browser tooling en el entorno) |
| **Sprint 2 = 100%** | **NO** — falta smoke manual UI de registro (Guardar / Guardar y crear otro / FeedbackCard) |

Tras 2 minutos en `http://localhost:5173/admin/users/new` confirmando esos clics, el Sprint 2 puede declararse **100%**.

---

## 9. Cómo repetir las pruebas

```powershell
# MySQL
cd backend; docker compose up -d

# API + FE (dos terminales)
npm run start:dev   # backend
npm run dev         # frontend/frontend

# Unit
cd backend; npx jest --testPathPatterns="users.service.spec|account-verification|auth.service.spec|password-recovery"
cd frontend/frontend; npm test -- --run src/shared/auth/session.test.ts src/shared/auth/session.pending.test.ts src/features/manage-user/model/useUserForm.test.ts src/features/auth/model/useVerificationActions.test.ts

# E2E API (requiere Ethereal en .env + imap en %TEMP%\s2qa)
cd backend; node scripts/s2-e2e-suite.mjs
```

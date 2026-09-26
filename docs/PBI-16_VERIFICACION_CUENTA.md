# PBI-16 — Verificación de cuenta

## Política técnica

| Parámetro | Valor |
|-----------|-------|
| Código | 6 dígitos numéricos (`crypto.randomInt`) |
| Almacenamiento | HMAC-SHA256 (`code_hash`), nunca en claro |
| Expiración | 15 minutos |
| Intentos máx. por código | 5 |
| Cooldown reenvío | 60 segundos |
| Reenvíos máx. / hora | 5 |

Constantes: `backend/src/common/constants/account-verification.constant.ts`

## Disparo

- Create manual con `status: ACTIVE` (default): **sin** verificación.
- Create manual con `status: PENDING`: genera código, intenta enviar correo, usuario queda PENDING.
- Fallo SMTP: no rollback; audit `USER_VERIFICATION_SEND_FAILED`; se puede reenviar.

## Endpoints públicos

- `POST /api/v1/auth/verify-account` `{ email, code }`
- `POST /api/v1/auth/resend-verification` `{ email }` (respuesta genérica anti-enumeración)

## Frontend

- Ruta pública `/verify-account`
- Link / flujo desde `/login` (`ACCOUNT_PENDING` → `verifyPrompt`)

## Migración

Ejecutar SQL: `backend/src/database/migrations/006_account_verifications.sql`  
**Estado local 2026-09-25:** tabla `account_verifications` presente.

## Checklist QA

- [x] Login ACTIVE (admin seed) funciona — **S2-T01 PASS**
- [x] Create ACTIVE → login inmediato, sin fila de verificación necesaria — **S2-T03 + login; ACTIVE no llama issueAndSend**
- [x] Create PENDING → stub/mail + verificación → ACTIVE → login — **S2-T06 SENT + S2-T07 verify + login PASS** (fix: `UsersService` ahora llama `issueAndSend`)
- [x] Código incorrecto / expirado / reusado → error genérico — **S2-T08 PASS**
- [x] Resend con email desconocido → mensaje genérico — **S2-T09 PASS**
- [x] Bulk import / edición / roles / JWT sin cambios de comportamiento — **Sin regresiones observadas en suite S2; fuera de cambios de este cierre**
- [x] Auditoría sin códigos en `before`/`after` — **S2-T-audit-no-codes PASS**

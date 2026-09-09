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
- Link desde `/login`

## Migración

Ejecutar SQL: `backend/src/database/migrations/006_account_verifications.sql`

## Checklist QA

- [ ] Login ACTIVE (admin seed) funciona
- [ ] Create ACTIVE → login inmediato, sin fila de verificación necesaria
- [ ] Create PENDING → stub/mail + verificación → ACTIVE → login
- [ ] Código incorrecto / expirado / reusado → error genérico
- [ ] Resend con email desconocido → mensaje genérico
- [ ] Bulk import / edición / roles / JWT sin cambios de comportamiento
- [ ] Auditoría sin códigos en `before`/`after`

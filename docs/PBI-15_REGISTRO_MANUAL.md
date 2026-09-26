# PBI-15 — Registro manual de usuario

## Alcance

Alta administrativa de un usuario institucional desde:

`Administrativo > Usuarios > Agregar usuarios > Registro manual`  
Ruta: `/admin/users/new`

## Flujo

1. El administrador completa el formulario (personal / institucional / acceso).
2. El frontend valida cédula, correo, roles, contraseña temporal y confirmación.
3. Se llama `POST /users` con el payload existente (sin `confirmPassword`).
4. **Guardar usuario** → pantalla de éxito (`FeedbackCard`).
5. **Guardar y crear otro** → toast + formulario limpio (sin pantalla de éxito).
6. **Cancelar** → vuelve a `/admin/users`.

## Campos

| Sección | Campo | Obligatorio | Persistido |
|---------|-------|-------------|------------|
| Personal | Nombres, Apellidos, Cédula, Correo, Teléfono | Sí (teléfono no) | Sí |
| Institucional | Estado, Rol(es) | Sí | Sí |
| Acceso | Contraseña temporal, Confirmar | Sí (solo create) | Solo password |

Identidad de acceso: **correo institucional** (no existe `username` en el dominio).

Roles reales: **Administrador**, **Docente**, **Estudiante** (solo ACTIVE).

## Fuera de alcance (PBI-15)

- Fecha de nacimiento, username distinto del email
- Especialidad / sección / grupo en el alta
- Correo de bienvenida y verificación de cuenta (PBI-16)
- Cambios a login o importación masiva
- Migraciones de base de datos

## Checklist QA manual

- [x] Crear usuario válido → FeedbackCard → ver ficha — **Evidencia:** S2-T03 `POST /users` PASS; UI `FeedbackCard` en `UserCreatePage.tsx` (smoke navegador pendiente para el click “Ver ficha”)
- [ ] Guardar y crear otro → toast + form vacío + usuario creado — **Código listo** (`intent === 'create-another'`); **NO ejecutado en navegador (S2-T05 SKIP)**
- [x] Cancelar → `/admin/users` — **Evidencia de código:** navegación a `/admin/users` en formulario; no re-ejecutado en browser en este cierre
- [x] Cédula o correo duplicado → error del backend en el formulario — **Evidencia:** S2-T04b dup email → 409
- [x] Sin rol / password distinta / cédula inválida → errores de frontend — **Evidencia:** `useUserForm.test.ts` PASS + S2-T04 API 400
- [x] Solo aparecen roles ACTIVE reales — **Evidencia:** `UserCreatePage` filtra `role.status === 'ACTIVE'`
- [x] Edición de usuario (`mode=edit`) no exige contraseña ni confirmación — **Evidencia:** `useUserForm.test.ts`

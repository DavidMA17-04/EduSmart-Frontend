# Reglas de diseño — EduSmart (CTP de Hojancha)

Documento para el equipo y para Cursor. Aplica a la interfaz administrativa y a las pantallas de Docente y Estudiante. Idioma de la UI: **español**.

---

## 1. Títulos

- Todo título de página, sección, modal o encabezado de tabla va en **oración**:
  - primera letra en **mayúscula**
  - el resto en **minúscula**
- Ejemplos:
  - Correcto: `Alertas de ausentismo`, `Reportes administrativos`, `Estado`
  - Incorrecto: `Alertas de Ausentismo`, `REPORTES ADMINISTRATIVOS`, `ESTADO`
- La marca del producto y del colegio **no** se transforma:
  - `EduSmart` (login) usa `data-preserve-case`
  - el lema del sidebar y del login pueden seguir en mayúsculas institucionales
- Implementación de referencia: `frontend/src/app/styles/admin-theme.css` y etiquetas del menú (`.navLabel`).

---

## 2. Botones de confirmación y cancelación

Cuando un bloque (footer de modal, fila de acciones de formulario, diálogo) tiene **dos acciones** del tipo afirmar / cancelar:

| Posición | Acción |
|----------|--------|
| **Izquierda** | Afirmación (`Guardar`, `Confirmar`, `Salir`, `Enviar`, `Aprobar`, `Eliminar`…) |
| **Derecha** | Cancelación (`Cancelar`, `Cerrar`…) |

- Componentes base ya correctos: `FormActions`, `ConfirmDialog`.
- Si se agregan botones a mano, respetar el mismo orden en el DOM (no invertir con CSS `row-reverse`).
- Con tres botones (p. ej. Aprobar / Rechazar / Cerrar): primero las afirmaciones, al final cancelar/cerrar.

---

## 3. Shell y menú por rol

- El shell autenticado es `RoleShell` → `AdminShell` en `/admin`.
- `RoleGate` / `StaffOnly` impiden que un **Estudiante** abra pantallas de personal (dashboard admin, alertas de ausentismo, indicadores, nueva clase, etc.).
- Etiqueta de audiencia en el sidebar: Administración / Docente / Estudiante.
- Menú agrupado: Usuarios, Estructura académica, Asistencias (expandibles).
- El sidebar se puede **ocultar parcialmente** (barra de iconos). El botón «Ocultar menú» / «Mostrar» va **debajo de Configuración**, no arriba del menú.
- Preferencia de colapso: `localStorage` clave `edusmart.sidebar.collapsed`.

### Qué debe ver cada rol (resumen)

- **Administrador:** menú completo.
- **Docente:** estructura académica, asistencias operativas, justificaciones, Mi horario. No usuarios/roles/reportes ni «Ingresar código».
- **Estudiante:** Mi horario, historial propio, justificaciones, Ingresar código, configuración. Sin alertas/indicadores de todo el colegio.

No inventar entradas de menú para módulos sin pantalla (estudiantes, disciplina, comunicaciones, apelaciones) mientras el backend responda «no implementado».

---

## 4. Marca y look institucional

- Paleta y tipografía: tokens en `frontend/src/styles/brand-tokens.css` (navy, gold, serif Merriweather / sans Source Sans 3).
- No sustituir la marca por temas genéricos (p. ej. morado sobre blanco, cream + terracotta, dark mode por defecto).
- Dentro del panel admin, **conservar** el sistema visual existente; no rediseñar el shell como landing promocional.
- Escudo y nombre del CTP: assets en `public/brand/`.

---

## 5. Formularios y validación

- No desactivar guards ni validaciones solo para que un flujo «pase».
- Mensajes de error y placeholders en español, tono institucional y claro.
- En docentes, el **departamento** es obligatorio (ciencias, matemáticas, informática, cocina, etc.). Select visible solo si el rol Docente está activo.

---

## 6. Criterios al implementar UI

1. Cambio mínimo; no reescribir pantallas que ya funcionan.
2. Tras un cambio visual: compilar y revisar en navegador (desktop y, si aplica, móvil ≤840px).
3. No usar mocks de producto para dar por buena una prueba de cierre.
4. Commits solo cuando se pidan; mensaje breve centrado en el *porqué*.

---

## Referencias de código

| Tema | Ubicación |
|------|-----------|
| Títulos CSS | `frontend/src/app/styles/admin-theme.css` |
| Shell / menú | `frontend/src/widgets/app-shell/` |
| Audiencia por rol | `RoleShell.tsx`, `roleAudience.tsx`, `adminNavigation.ts` |
| Acciones estándar | `shared/ui/FormActions.tsx`, `shared/ui/ConfirmDialog.tsx` |
| Departamentos docente | `entities/department/`, `features/manage-department/` |

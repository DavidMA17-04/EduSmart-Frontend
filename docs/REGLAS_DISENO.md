# Reglas de diseño — EduSmart (CTP de Hojancha)

Documento para el equipo y para Cursor. Aplica a **todos** los portales autenticados (`/admin`, `/teacher`, `/director`, `/counselor`, `/security`, `/student`, `/guardian`): comparten el mismo `RoleShell` → `AdminShell`. Idioma de la UI: **español**.

---

## 1. Títulos y tipografía (oración)

- Todo título de página, sección, modal, encabezado de tabla o **label** de UI va en **oración**:
  - primera letra en **mayúscula**
  - el resto en **minúscula**
- Ejemplos:
  - Correcto: `Alertas de ausentismo`, `Reportes administrativos`, `Estado`
  - Incorrecto: `Alertas de Ausentismo`, `REPORTES ADMINISTRATIVOS`, `ESTADO`
- Sin `uppercase tracking` en labels de producto (KPIs, formularios, tablas).
- La marca del producto y del colegio **no** se transforma:
  - `EduSmart` (login) usa `data-preserve-case`
  - el lema del sidebar y del login pueden seguir en mayúsculas institucionales
- No usar `data-preserve-case` en headers de módulo solo para saltarse la regla.
- Implementación: `frontend/src/app/styles/admin-theme.css` (`.admin-shell` h1–h4 / `th`) y `.navLabel`.

---

## 2. Botones

### Variantes (`shared/ui/Button`)

| Variante | Uso |
|----------|-----|
| `primary` | CTA principal (navy `--brand-primary`) |
| `secondary` | Acción secundaria / outline |
| `danger` | Destructivo / rechazo (`--brand-danger`) |

- Primario = **navy**. Gold (`--brand-gold`) solo como acento de marca (bordes, lema, highlight), no como CTA sustituto del navy en la misma fila sin regla clara.
- Toolbars de fila: `RowActions` / `RowActionButton` con el mismo look.

### Orden afirmar / cancelar

Cuando un bloque (footer de modal, fila de acciones de formulario, diálogo) tiene **dos acciones** del tipo afirmar / cancelar:

| Posición | Acción |
|----------|--------|
| **Izquierda** | Afirmación (`Guardar`, `Confirmar`, `Salir`, `Enviar`, `Aprobar`, `Eliminar`, `Matricular`…) |
| **Derecha** | Cancelación (`Cancelar`, `Cerrar`…) |

- Componentes base: `FormActions`, `ConfirmDialog`.
- Si se agregan botones a mano, respetar el mismo orden en el DOM (no invertir con CSS `row-reverse` ni poner Cancelar primero).
- Con tres botones (p. ej. Aprobar / Rechazar / Cerrar, o Guardar / Restablecer / Cancelar): primero las afirmaciones, **al final** cancelar/cerrar.

---

## 3. Formularios

- Preferir `FormLayout` + `FormActions` / `ModalCrud`.
- Prohibido inventar footers con orden invertido (Cancelar a la izquierda del afirmar).
- No desactivar guards ni validaciones solo para que un flujo «pase».
- Mensajes de error y placeholders en español, tono institucional y claro.
- En docentes, el **departamento** es obligatorio. Select visible solo si el rol Docente está activo.

---

## 4. Avisos y feedback

| Situación | Componente | Notas |
|-----------|------------|--------|
| Éxito / error tras mutación (CRUD modal, guardar) | `Toast` (`useToast`) | Efímero |
| Error de carga o aviso persistente en página | `Alert` (variantes) / `FeedbackCard` | En contexto |
| Confirmación destructiva o de cambio de estado | `ConfirmDialog` | **Nunca** `window.confirm` / `alert` / `prompt` |

### Variantes de `Alert`

`info` | `success` | `warning` | `error` — colores solo desde tokens brand (navy / green / warning / danger).

---

## 5. Anuncios y comunicados

- Tipografía en oración; sin micro-labels en mayúsculas con tracking extremo.
- Acento gold solo para destacado institucional.
- CTA = navy (`--brand-primary` / clases Tailwind `brand-primary`), **nunca** el navy paralelo `#0d2346`.
- Preferir `PageHeader`, `Button`, `ConfirmDialog`, `KpiCard` compartidos frente a chrome Tailwind inventado.

---

## 6. KPI y estadísticas

Receta única: **card clara + borde superior accent + icono circular** (no gradients rellenos ni bloques navy sólidos).

- Componente: `KpiCard` / `KpiGrid`.
- Tones permitidos: `navy` | `gold` | `green` | `warning` | `danger` | `muted`.
- Label en oración; valor tabular; hint opcional.

---

## 7. Gráficos

- Recharts (u otro canvas) debe usar `brandColors` / `chartTheme` (`frontend/src/styles/`).
- Sin paleta default de Recharts; sin teal `#0E7490` ni colores fuera del set institucional.

---

## 8. Marca y paleta (CTP / MEP)

- Fuente de verdad: `frontend/src/styles/brand-tokens.css` + `brandColors.ts` + `public/brand/README.md`.
- Tipografía: Merriweather (serif) / Source Sans 3 (sans).
- No sustituir la marca por temas genéricos (morado sobre blanco, cream + terracotta, dark mode por defecto).
- Conservar el shell admin existente; no rediseñar como landing promocional.
- Escudo y nombre del CTP: `public/brand/`.

### Colores prohibidos en producto

Indigo (`#165DFB`, `#6366F1`), purple genérico de Tailwind, emerald Tailwind (`#10b981` / `emerald-*` como marca), navy paralelo `#0d2346` / `#133261`, verdes/rojos genéricos `#059669` / `#e11d48`, teal `#0E7490`, gold legacy `#C5A028`.

Usar en su lugar: `--brand-primary`, `--brand-navy`, `--brand-green`, `--brand-danger`, `--brand-gold`, etc. En islas Tailwind: clases `brand-*` del `tailwind.config`.

---

## 9. Shell y menú por rol

- El shell autenticado es `RoleShell` → `AdminShell` (clase `admin-shell`) en **todos** los portales.
- `RoleGate` / `StaffOnly` impiden que un **Estudiante** abra pantallas de personal.
- Etiqueta de audiencia en el sidebar según rol.
- Preferencia de colapso: `localStorage` clave `edusmart.sidebar.collapsed`.
- No inventar entradas de menú para módulos sin pantalla mientras el backend responda «no implementado».

---

## 10. Criterios al implementar UI

1. Cambio mínimo; no reescribir pantallas que ya funcionan.
2. Pantallas nuevas: `shared/ui` + tokens (CSS modules o Tailwind `brand-*`).
3. Tras un cambio visual: compilar y revisar en navegador (desktop y, si aplica, móvil ≤840px).
4. No usar mocks de producto para dar por buena una prueba de cierre.
5. Commits solo cuando se pidan; mensaje breve centrado en el *porqué*.

---

## 11. Checklist pre-merge (Raymond-proof)

- [ ] CTA principal navy (`#002E7A` / `--brand-primary`), no gold ni tercer navy.
- [ ] Footer afirmar | cancelar (cancelar a la derecha).
- [ ] KPIs con `KpiCard` (o misma receta visual).
- [ ] Charts solo con `brandColors` / `chartTheme`.
- [ ] Títulos y labels en oración; sin `uppercase tracking` de producto.
- [ ] Sin purple / emerald Tailwind / `#0d2346` / `window.confirm` / `alert` nativo.
- [ ] Feedback: mutación → toast; error de página → Alert.

---

## Referencias de código

| Tema | Ubicación |
|------|-----------|
| Tokens CTP | `frontend/src/styles/brand-tokens.css`, `brandColors.ts`, `chartTheme.ts` |
| Paleta documentada | `frontend/public/brand/README.md` |
| Títulos CSS | `frontend/src/app/styles/admin-theme.css` |
| Shell / menú | `frontend/src/widgets/app-shell/` |
| Audiencia por rol | `RoleShell.tsx`, `roleAudience.tsx`, `adminNavigation.ts` |
| Acciones estándar | `shared/ui/FormActions.tsx`, `shared/ui/ConfirmDialog.tsx` |
| KPI | `shared/ui/KpiCard.tsx` |
| Guía shared UI | `shared/ui/README.md` |
| Departamentos docente | `entities/department/`, `features/manage-department/` |

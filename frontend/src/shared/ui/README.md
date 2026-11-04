# Shared Admin UI (Design System)

CSS Modules + CTP brand tokens (`--brand-*`, `--admin-*`). Use these instead of inventing per-page chrome. Rules: `frontend/docs/REGLAS_DISENO.md`.

| Component | When to use |
|-----------|-------------|
| `PageHeader` | Every admin page: breadcrumbs, title, icon, contextual `back`, primary action slot |
| `DataToolbar` | Search + filters + primary CTA above tables |
| `DataTableShell` | Card wrapper for table + toolbar + pagination footer |
| `RowActions` / `RowActionButton` | Icon buttons in table rows |
| `EmptyState` | Lists with no records (icon, copy, CTA) |
| `FeedbackCard` | Celebratory success/error after key create flows |
| `StatusBadge` | Status pills (`active` \| `inactive` \| `closed` \| `pending` \| `warning` \| `danger`) |
| `ConfirmDialog` | Destructive / state-machine confirms (**never** `window.confirm` / `alert`) |
| `ToastProvider` / `useToast` | Silent success/error after modal CRUD (mutations) |
| `Alert` | Page-level / load errors (`info` \| `success` \| `warning` \| `error`) |
| `KpiCard` / `KpiGrid` | Stats tiles (card + top border + circular icon; tones `navy`…`muted`) |
| `SegmentedTabs` | Capsule tab switchers |
| `FormLayout` | Field groups + form error + actions |
| `FormActions` | Submit (left) then Cancel (right) |
| `ModalCrud` | Standard create/edit modal shell |
| `Button` | `primary` \| `secondary` \| `danger` |

Charts: import `chartTheme` / `brandColors` from `@/styles/` — never hardcode Recharts palette defaults.

Tailwind islands (comms/security): use `brand-*` colors from `tailwind.config.js`, not `#0d2346` / `emerald-*` / purple.

Wire `ToastProvider` once at app root (around the router).

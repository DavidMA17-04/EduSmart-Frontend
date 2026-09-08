# Shared Admin UI (Design System)

CSS Modules + CTP brand tokens (`--brand-*`, `--admin-*`). Use these instead of inventing per-page chrome.

| Component | When to use |
|-----------|-------------|
| `PageHeader` | Every admin page: breadcrumbs, title, icon, contextual `back`, primary action slot |
| `DataToolbar` | Search + filters + primary CTA above tables |
| `DataTableShell` | Card wrapper for table + toolbar + pagination footer |
| `RowActions` / `RowActionButton` | Icon buttons in table rows |
| `EmptyState` | Lists with no records (icon, copy, CTA) |
| `FeedbackCard` | Celebratory success/error after key create flows |
| `StatusBadge` | Status pills (`active` \| `inactive` \| `closed` \| `pending` \| `warning` \| `danger`) |
| `ConfirmDialog` | Destructive / state-machine confirms (never `window.confirm`) |
| `ToastProvider` / `useToast` | Silent success after modal CRUD |
| `SegmentedTabs` | Capsule tab switchers |
| `FormLayout` | Field groups + form error + actions |
| `ModalCrud` | Standard create/edit modal shell |

Wire `ToastProvider` once at app root (around the router).

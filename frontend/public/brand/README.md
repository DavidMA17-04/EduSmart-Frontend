# Identidad gráfica C.T.P. de Hojancha

Assets derivados de `grafic_elements/` (Manual de identidad gráfica 2026-2030).

- `ctp-hojancha-logo.jpeg` — escudo institucional
- `mep-logo.jpeg` — Ministerio de Educación Pública (referencia secundaria)
- `mep-logo-gold.jpeg` — variante dorada MEP

Usar según manual institucional. La UI prioriza **C.T.P. de Hojancha** sobre la marca del proyecto.

## Paleta oficial (UI)

Fuente canónica CSS: `src/styles/brand-tokens.css`. Espejo JS (charts): `src/styles/brandColors.ts`.  
El tema admin (`admin-theme.css`) y `variables.css` derivan de `--brand-*`.

| Rol | Hex | Token CSS |
|-----|-----|-----------|
| Navy / sidebar / texto | `#021A53` | `--brand-navy` |
| Navy profundo (gradientes) | `#01133D` | `--brand-navy-deep` |
| Primary | `#002E7A` | `--brand-primary` |
| Primary hover | `#164687` | `--brand-primary-hover` |
| Primary light | `#EFF4FB` | `--brand-primary-light` |
| Gold / acento escudo | `#CFAC65` | `--brand-gold` |
| Gold oscuro | `#9B7D2E` | `--brand-gold-dark` |
| Gold light | `#F8F1E3` | `--brand-gold-light` |
| Success / verde | `#168750` | `--brand-green` |
| Green hover | `#147445` | `--brand-green-hover` |
| Nav muted | `#DBE8FF` | `--brand-nav-muted` |
| Nav accent | `#7EB6FF` | `--brand-nav-accent` |
| Warning | `#B86800` | `--brand-warning` |
| Danger | `#D32F2F` | `--brand-danger` |
| Fondo | `#F5F6F8` | `--brand-background` |
| Superficie | `#FFFFFF` | `--brand-surface` |
| Borde | `#C1C5C8` | `--brand-border` |
| Muted | `#6B7280` | `--brand-muted` |

No introducir azules indigo (`#165DFB`, `#6366F1`) ni dorados legacy (`#C5A028`) en pantallas admin/login.

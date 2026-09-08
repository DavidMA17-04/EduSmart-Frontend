/**
 * Espejo JS de la paleta CTP en `styles/brand-tokens.css`.
 * Usar en charts/canvas donde CSS variables no aplican directamente.
 */
export const brandColors = {
  navy: '#021A53',
  navyDeep: '#01133D',
  primary: '#002E7A',
  primaryHover: '#164687',
  primaryLight: '#EFF4FB',
  gold: '#CFAC65',
  goldDark: '#9B7D2E',
  goldLight: '#F8F1E3',
  green: '#168750',
  greenHover: '#147445',
  greenLight: '#E8F5EC',
  navMuted: '#DBE8FF',
  navAccent: '#7EB6FF',
  warning: '#B86800',
  danger: '#D32F2F',
  background: '#F5F6F8',
  surface: '#FFFFFF',
  border: '#C1C5C8',
  muted: '#6B7280',
} as const;

export type BrandColor = (typeof brandColors)[keyof typeof brandColors];

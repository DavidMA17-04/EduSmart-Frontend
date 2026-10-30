import {
  casesExportPath,
  dashboardQuery,
  type DisciplinaryDashboard,
  type DisciplinaryDashboardAlert,
  type DisciplinaryDashboardFilters,
} from '@/entities/discipline/model/queries';

export type { DisciplinaryDashboard, DisciplinaryDashboardAlert, DisciplinaryDashboardFilters };
export { casesExportPath, dashboardQuery };

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatDashboardMonth(month: string): string {
  const [year, raw] = month.split('-');
  const label = MONTHS[Number(raw) - 1];
  return label && year ? `${label} ${year}` : month;
}

/** Prefer the group code when it already includes the grade (`10-1`, not `10-10-1`). */
export function formatSectionLabel(
  gradeLevel: number | string | null | undefined,
  groupName: string | null | undefined,
): string {
  const name = groupName?.trim() ?? '';
  if (!name && (gradeLevel == null || gradeLevel === '')) return '';
  if (!name) return String(gradeLevel);
  if (gradeLevel == null || gradeLevel === '') return name;
  if (name.includes('-')) return name;
  const prefix = `${gradeLevel}-`;
  if (name === String(gradeLevel) || name.startsWith(prefix)) return name;
  return `${prefix}${name}`;
}

export function dedupeSectionLabel(label: string | null | undefined): string {
  if (!label) return '';
  return label.replace(/^(\d+)-\1-(.+)$/, '$1-$2');
}

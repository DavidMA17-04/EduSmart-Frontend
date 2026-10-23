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

import type { DisciplinaryCaseFilters, DisciplinaryCaseStatus, InfractionSeverity } from './types';

export type DisciplinaryDashboardFilters = {
  academicPeriodId?: number;
  gradeLevel?: number;
  groupId?: number;
};

export type DisciplinaryDashboardAlert = {
  code: string;
  message: string;
  caseId?: number;
  caseNumber?: string;
  studentUserId?: number;
  fullName?: string;
};

export type DisciplinaryDashboard = {
  total: number;
  byStatus: Array<{ status: string; label: string; count: number }>;
  bySeverity: Array<{ severity: string; label: string; count: number }>;
  bySection: Array<{ groupId: number; sectionLabel: string; count: number }>;
  byMonth: Array<{ month: string; count: number }>;
  deadlines: { dueSoon: number; overdue: number };
  alerts: DisciplinaryDashboardAlert[];
  topStudents: Array<{ studentUserId: number; fullName: string; count: number }>;
};

export function caseListQuery(filters: DisciplinaryCaseFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.deadline) params.set('deadline', filters.deadline);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function historyQuery(filters: {
  academicPeriodId?: number;
  status?: DisciplinaryCaseStatus;
  severity?: InfractionSeverity;
}): string {
  const params = new URLSearchParams();
  if (filters.academicPeriodId) params.set('academicPeriodId', String(filters.academicPeriodId));
  if (filters.status) params.set('status', filters.status);
  if (filters.severity) params.set('severity', filters.severity);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function dashboardQuery(filters: DisciplinaryDashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.academicPeriodId) params.set('academicPeriodId', String(filters.academicPeriodId));
  if (filters.gradeLevel) params.set('gradeLevel', String(filters.gradeLevel));
  if (filters.groupId) params.set('groupId', String(filters.groupId));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function casesExportPath(
  format: 'excel' | 'pdf',
  filters: Pick<DisciplinaryDashboardFilters, 'academicPeriodId' | 'groupId'>,
): string {
  return `/disciplinary/cases/export/${format}${dashboardQuery(filters)}`;
}

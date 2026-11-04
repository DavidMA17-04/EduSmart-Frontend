import type { AppealKind, AppealOutcomeFilter, DeadlineIndicator, DisciplinaryAppealDashboard, DisciplinaryCaseStatus } from './types';
import { APPEAL_KIND_LABELS, APPEAL_OUTCOME_LABELS } from './appealCenter';
import { STATUS_LABELS } from './caseInbox';

export const APPEAL_REPORTS_COPY = {
  title: 'Reportes de recursos',
  subtitle: 'Indicadores y exportación de revocatorias y apelaciones de conducta. La nota de conducta no se calcula aquí.',
  empty: 'No hay recursos con los filtros elegidos.',
  filtersHint: 'Los indicadores y el archivo usan los mismos filtros.',
  exportExcel: 'Excel',
  exportPdf: 'PDF',
  noCsv: 'Solo se ofrece Excel y PDF.',
} as const;

const FORBIDDEN_REPORT_TERMS = ['beca', 'becas', 'ape-', 'comité', 'comite', 'nota académica', 'csv', 'cron'];

export function appealReportsCopyIsScoped(copy: typeof APPEAL_REPORTS_COPY = APPEAL_REPORTS_COPY): boolean {
  const blob = Object.values(copy).join(' ').toLowerCase();
  return FORBIDDEN_REPORT_TERMS.every((term) => !blob.includes(term));
}

export function appealReportsHasCsvOrCron(labels: readonly string[]): boolean {
  return labels.some((label) => /csv|cron|programad/i.test(label));
}

export type AppealReportFilters = {
  kind?: AppealKind;
  outcome?: AppealOutcomeFilter;
  deadline?: DeadlineIndicator;
};

export const APPEAL_REPORT_KIND_OPTIONS: Array<{ value: '' | AppealKind; label: string }> = [
  { value: '', label: 'Todos los recursos' },
  { value: 'REVOCATION', label: APPEAL_KIND_LABELS.REVOCATION },
  { value: 'APPEAL', label: APPEAL_KIND_LABELS.APPEAL },
];

export const APPEAL_REPORT_OUTCOME_OPTIONS: Array<{ value: '' | AppealOutcomeFilter; label: string }> = [
  { value: '', label: 'Todos los resultados' },
  { value: 'PENDING', label: APPEAL_OUTCOME_LABELS.PENDING },
  { value: 'UPHOLD', label: APPEAL_OUTCOME_LABELS.UPHOLD },
  { value: 'REVOKE', label: APPEAL_OUTCOME_LABELS.REVOKE },
  { value: 'MODIFY', label: APPEAL_OUTCOME_LABELS.MODIFY },
];

export const APPEAL_REPORT_DEADLINE_OPTIONS: Array<{ value: '' | Exclude<DeadlineIndicator, 'NONE'>; label: string }> = [
  { value: '', label: 'Todos los plazos' },
  { value: 'ON_TIME', label: 'En plazo' },
  { value: 'DUE_SOON', label: 'Por vencer' },
  { value: 'OVERDUE', label: 'Vencido' },
];

export function appealDashboardKpis(board: DisciplinaryAppealDashboard) {
  return [
    { key: 'total', label: 'Total', value: board.total },
    { key: 'pending', label: 'Pendientes', value: board.pending },
    { key: 'resolved', label: 'Resueltos', value: board.resolved },
    { key: 'onTime', label: 'En plazo', value: board.onTime },
    { key: 'dueSoon', label: 'Por vencer', value: board.dueSoon },
    { key: 'overdue', label: 'Vencidos', value: board.overdue },
    { key: 'revocations', label: 'Revocatorias', value: board.byKind.REVOCATION },
    { key: 'appeals', label: 'Apelaciones', value: board.byKind.APPEAL },
  ];
}

export function appealOutcomeRows(board: DisciplinaryAppealDashboard) {
  return (Object.entries(board.byOutcome) as Array<[keyof typeof board.byOutcome, number]>).map(([key, value]) => ({
    label: APPEAL_OUTCOME_LABELS[key],
    value,
  }));
}

export function appealStatusRows(board: DisciplinaryAppealDashboard) {
  return (Object.entries(board.byCaseStatus) as Array<[DisciplinaryCaseStatus, number]>)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      label: STATUS_LABELS[key] ?? key,
      value,
    }));
}

export function isEmptyAppealDashboard(board: DisciplinaryAppealDashboard | null): boolean {
  return !board || board.total === 0;
}

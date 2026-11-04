import { describe, expect, it } from 'vitest';
import {
  APPEAL_REPORTS_COPY,
  appealDashboardKpis,
  appealReportsCopyIsScoped,
  appealReportsHasCsvOrCron,
  isEmptyAppealDashboard,
} from './appealReports';
import type { DisciplinaryAppealDashboard } from './types';

const board: DisciplinaryAppealDashboard = {
  total: 3,
  pending: 1,
  resolved: 2,
  onTime: 1,
  dueSoon: 0,
  overdue: 0,
  byKind: { REVOCATION: 2, APPEAL: 1 },
  byOutcome: { PENDING: 1, UPHOLD: 1, REVOKE: 0, MODIFY: 1 },
  byCaseStatus: { IN_APPEAL: 1, FIRM: 2 },
};

describe('reportes de recursos', () => {
  it('no menciona becas, comités, CSV ni envío programado', () => {
    expect(appealReportsCopyIsScoped()).toBe(true);
    expect(appealReportsHasCsvOrCron([APPEAL_REPORTS_COPY.exportExcel, APPEAL_REPORTS_COPY.exportPdf])).toBe(false);
    expect(appealReportsHasCsvOrCron(['CSV', 'Cron'])).toBe(true);
  });

  it('arma indicadores de recursos reales y detecta el vacío', () => {
    expect(appealDashboardKpis(board).map((item) => item.label)).toEqual([
      'Total',
      'Pendientes',
      'Resueltos',
      'En plazo',
      'Por vencer',
      'Vencidos',
      'Revocatorias',
      'Apelaciones',
    ]);
    expect(isEmptyAppealDashboard({ ...board, total: 0 })).toBe(true);
    expect(JSON.stringify(board)).not.toMatch(/beca|nota académica/i);
  });
});

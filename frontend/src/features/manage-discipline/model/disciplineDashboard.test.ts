import { describe, expect, it } from 'vitest';
import { casesExportPath, dashboardQuery, formatDashboardMonth } from './disciplineDashboard';

describe('tablero disciplinario', () => {
  it('arma la consulta de período, nivel y sección', () => {
    expect(dashboardQuery({})).toBe('');
    expect(dashboardQuery({ academicPeriodId: 4, gradeLevel: 10, groupId: 8 })).toBe(
      '?academicPeriodId=4&gradeLevel=10&groupId=8',
    );
  });

  it('la exportación del listado no envía el nivel', () => {
    expect(casesExportPath('excel', { academicPeriodId: 4, groupId: 8 })).toBe(
      '/disciplinary/cases/export/excel?academicPeriodId=4&groupId=8',
    );
    expect(casesExportPath('pdf', {})).toBe('/disciplinary/cases/export/pdf');
  });

  it('nombra el mes del gráfico', () => {
    expect(formatDashboardMonth('2026-03')).toBe('mar 2026');
    expect(formatDashboardMonth('2026-13')).toBe('2026-13');
  });
});

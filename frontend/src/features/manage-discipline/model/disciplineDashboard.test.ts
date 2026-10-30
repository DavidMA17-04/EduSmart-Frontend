import { describe, expect, it } from 'vitest';
import {
  casesExportPath,
  dashboardQuery,
  dedupeSectionLabel,
  formatDashboardMonth,
  formatSectionLabel,
} from './disciplineDashboard';

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

describe('etiquetas de sección', () => {
  it('no duplica el nivel como prefijo del código de grupo', () => {
    expect(formatSectionLabel(10, '10-1')).toBe('10-1');
    expect(formatSectionLabel(10, 'A')).toBe('10-A');
    expect(formatSectionLabel(10, 'D4-10-A')).toBe('D4-10-A');
    expect(dedupeSectionLabel('10-10-1')).toBe('10-1');
    expect(dedupeSectionLabel('D4-10-A')).toBe('D4-10-A');
  });
});

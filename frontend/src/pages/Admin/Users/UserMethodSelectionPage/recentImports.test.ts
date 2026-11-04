import { describe, expect, it } from 'vitest';
import { CEDULA_IMPORT_HINT, readRecentImports } from './recentImports';

describe('hub de incorporación — importaciones recientes', () => {
  it('queda vacío si no hay historial real', () => {
    expect(readRecentImports({ getItem: () => null })).toEqual([]);
    expect(readRecentImports({ getItem: () => '[]' })).toEqual([]);
  });

  it('no inventa los xlsx/csv de demostración', () => {
    const items = readRecentImports({ getItem: () => null });
    expect(items.some((item) => item.name.includes('Estudiantes_Seccion_10-B.xlsx'))).toBe(false);
    expect(items.some((item) => item.name.includes('Docentes_Especialidades_2026.csv'))).toBe(false);
  });

  it('el copy de cédula usa el rango 9–30', () => {
    expect(CEDULA_IMPORT_HINT).toMatch(/9 y 30/);
    expect(CEDULA_IMPORT_HINT.toLowerCase()).not.toMatch(/exactamente 9/);
  });
});

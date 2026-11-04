import { describe, expect, it } from 'vitest';
import { validateDisciplinarySettings, validateNonWorkingDay } from './calendarSettings';

describe('calendario disciplinario', () => {
  it('exige fecha y motivo del día no hábil', () => {
    expect(validateNonWorkingDay('', 'Navidad')).toBe('Indique la fecha del día no hábil.');
    expect(validateNonWorkingDay('2026-12-25', ' ')).toBe('Indique el motivo.');
    expect(validateNonWorkingDay('2026-12-25', 'Navidad')).toBeNull();
  });

  it('acepta los umbrales por defecto y rechaza valores fuera de rango', () => {
    expect(validateDisciplinarySettings({ recidivismThreshold: 3, conductAlertThreshold: 80 })).toBeNull();
    expect(validateDisciplinarySettings({ recidivismThreshold: 0, conductAlertThreshold: 80 })).toMatch(/reincidencia/);
    expect(validateDisciplinarySettings({ recidivismThreshold: 3, conductAlertThreshold: 101 })).toMatch(/nota/);
  });
});

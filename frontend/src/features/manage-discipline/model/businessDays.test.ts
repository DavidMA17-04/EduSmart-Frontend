import { describe, expect, it } from 'vitest';
import { addBusinessDays, addNaturalDays, isBusinessDay } from './businessDays';
import { buildDeadlineSchedule } from './deadlineSchedule';

describe('días hábiles', () => {
  it('sábado y domingo no son hábiles', () => {
    expect(isBusinessDay('2026-10-17')).toBe(false);
    expect(isBusinessDay('2026-10-18')).toBe(false);
    expect(isBusinessDay('2026-10-19')).toBe(true);
  });

  it('el plazo corre desde el día hábil siguiente y salta el fin de semana', () => {
    // Miércoles 14 + 5 hábiles → miércoles 21
    expect(addBusinessDays('2026-10-14', 5)).toBe('2026-10-21');
    // Viernes 16 + 1 hábil → lunes 19
    expect(addBusinessDays('2026-10-16', 1)).toBe('2026-10-19');
  });

  it('respeta días no hábiles institucionales', () => {
    expect(addBusinessDays('2026-10-16', 1, new Set(['2026-10-19']))).toBe('2026-10-20');
  });

  it('cruza de mes y suma días naturales', () => {
    expect(addBusinessDays('2026-10-29', 3)).toBe('2026-11-03');
    expect(addNaturalDays('2026-10-25', 10)).toBe('2026-11-04');
  });
});

describe('buildDeadlineSchedule', () => {
  it('encadena los pasos del Art. 150 en el peor caso', () => {
    const schedule = buildDeadlineSchedule('2026-10-14');
    expect(schedule.steps.map((s) => s.dueOn)).toEqual([
      '2026-10-21', // reporte +5
      '2026-11-04', // investigación +10
      '2026-11-09', // comunicación +3
      '2026-11-12', // descargo +3
      '2026-11-19', // resolución +5
    ]);
    expect(schedule.firmBy).toBe('2026-11-24');
  });
});

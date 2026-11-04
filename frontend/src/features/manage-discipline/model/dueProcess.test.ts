import { describe, expect, it } from 'vitest';
import {
  DUE_PROCESS_STEPS,
  PROCESS_REMEDIES,
  totalDueProcessBusinessDays,
} from './dueProcess';

describe('Debido proceso (REAC 2026, Art. 150)', () => {
  it('tiene los seis pasos en orden', () => {
    expect(DUE_PROCESS_STEPS.map((s) => s.title)).toEqual([
      'Reporte',
      'Investigación',
      'Comunicación formal',
      'Descargo',
      'Resolución',
      'Notificación',
    ]);
  });

  it('plazos de la guía en días hábiles: 5/10/3/3/5', () => {
    expect(DUE_PROCESS_STEPS.slice(0, 5).map((s) => s.days)).toEqual([5, 10, 3, 3, 5]);
    expect(totalDueProcessBusinessDays()).toBe(26);
  });

  it('recursos: revocatoria 3+3, apelación 3+8, retiro precautorio ≤10 naturales', () => {
    const [revocatoria, apelacion, retiro] = PROCESS_REMEDIES;
    expect([revocatoria.fileDays, revocatoria.resolveDays]).toEqual([3, 3]);
    expect([apelacion.fileDays, apelacion.resolveDays]).toEqual([3, 8]);
    expect(retiro).toMatchObject({ fileDays: 10, dayKind: 'naturales' });
  });
});

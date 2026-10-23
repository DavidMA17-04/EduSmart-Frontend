import { describe, expect, it } from 'vitest';
import { computeConductGrade, totalDeduction } from './conductGrade';
import type { InfractionSeverityRule } from './types';

const RULES: InfractionSeverityRule[] = [
  { severity: 'VERY_MINOR', label: 'Muy leve', deduction: 5, track: 'DIRECT' },
  { severity: 'MINOR', label: 'Leve', deduction: 10, track: 'DIRECT' },
  { severity: 'SERIOUS', label: 'Grave', deduction: 20, track: 'DUE_PROCESS' },
  { severity: 'VERY_SERIOUS', label: 'Muy grave', deduction: 35, track: 'DUE_PROCESS' },
  { severity: 'EXTREMELY_SERIOUS', label: 'Gravísima', deduction: 50, track: 'DUE_PROCESS' },
];

describe('nota de conducta', () => {
  it('sin faltas firmes es 100', () => {
    expect(computeConductGrade({}, RULES)).toBe(100);
  });

  it('una leve y una grave firmes → 70 (spec conduct-history)', () => {
    expect(computeConductGrade({ MINOR: 1, SERIOUS: 1 }, RULES)).toBe(70);
  });

  it('nunca baja de 0', () => {
    expect(totalDeduction({ EXTREMELY_SERIOUS: 3 }, RULES)).toBe(150);
    expect(computeConductGrade({ EXTREMELY_SERIOUS: 3 }, RULES)).toBe(0);
  });

  it('ignora cantidades negativas', () => {
    expect(computeConductGrade({ MINOR: -2 }, RULES)).toBe(100);
  });
});

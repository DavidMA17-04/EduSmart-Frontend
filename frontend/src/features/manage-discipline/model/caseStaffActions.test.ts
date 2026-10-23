import { describe, expect, it } from 'vitest';
import {
  canOfferPrecautionary,
  canOfferWrittenDefense,
  inclusiveNaturalDays,
  openAppeal,
  validateLength,
  validatePrecautionarySpan,
} from './caseStaffActions';
import type { CaseAppeal } from './types';

const appeal = (kind: CaseAppeal['kind'], outcome: CaseAppeal['outcome']): CaseAppeal => ({
  id: 1,
  kind,
  isSubsidiary: false,
  body: 'Texto del recurso presentado.',
  filedAt: '2026-10-19T18:00:00.000Z',
  filedByUserId: 9,
  outcome,
  newSeverity: null,
  reasoning: null,
  resolverUserId: null,
  resolvedAt: null,
});

describe('acciones del expediente', () => {
  it('exige la longitud del escrito y cuenta los días naturales de forma inclusiva', () => {
    expect(validateLength('corto', 10, 2000, 'La acción')).toMatch(/10/);
    expect(validateLength('Acción correctiva propuesta para el estudiante.', 10, 2000, 'La acción')).toBeNull();
    expect(inclusiveNaturalDays('2026-10-19', '2026-10-25')).toBe(7);
    expect(validatePrecautionarySpan('2026-10-19', '2026-10-30')).toMatch(/10 días/);
  });

  it('ofrece el retiro solo en debido proceso grave y abierto, y el descargo escrito mientras el cargo está comunicado', () => {
    expect(
      canOfferPrecautionary({ hasPermission: true, track: 'DUE_PROCESS', status: 'INVESTIGATING', severity: 'SERIOUS' }),
    ).toBe(true);
    expect(
      canOfferPrecautionary({ hasPermission: true, track: 'DUE_PROCESS', status: 'FIRM', severity: 'SERIOUS' }),
    ).toBe(false);
    expect(
      canOfferPrecautionary({ hasPermission: false, track: 'DUE_PROCESS', status: 'INVESTIGATING', severity: 'MINOR' }),
    ).toBe(false);
    expect(
      canOfferWrittenDefense({ isConductor: true, track: 'DUE_PROCESS', status: 'COMMUNICATED', defenseCount: 0 }),
    ).toBe(true);
    expect(
      canOfferWrittenDefense({ isConductor: true, track: 'DUE_PROCESS', status: 'COMMUNICATED', defenseCount: 1 }),
    ).toBe(false);
  });

  it('encuentra el recurso pendiente de resolver', () => {
    expect(openAppeal([appeal('REVOCATION', null)], 'REVOCATION')?.kind).toBe('REVOCATION');
    expect(openAppeal([appeal('REVOCATION', 'UPHOLD')], 'REVOCATION')).toBeNull();
  });
});

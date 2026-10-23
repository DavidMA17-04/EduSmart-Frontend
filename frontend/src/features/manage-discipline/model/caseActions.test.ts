import { describe, expect, it } from 'vitest';
import { appealHeading, availableCaseActions, EVENT_LABELS } from './caseActions';

const base = {
  status: 'INVESTIGATING' as const,
  track: 'DUE_PROCESS' as const,
  isConductor: false,
  isReporter: false,
  canReview: false,
  canConfigure: false,
  canFollowUp: false,
};

describe('availableCaseActions', () => {
  it('ofrece investigar solo al conductor de un caso reportado', () => {
    expect(availableCaseActions({ ...base, status: 'REPORTED', isConductor: true })).toContain('investigate');
    expect(availableCaseActions({ ...base, status: 'REPORTED' })).not.toContain('investigate');
  });

  it('en investigación deja observar, pedir información, archivar y comunicar al conductor', () => {
    const actions = availableCaseActions({ ...base, isConductor: true, canFollowUp: true });
    expect(actions).toEqual(
      expect.arrayContaining(['observe', 'requestInformation', 'communicate', 'archive', 'requestCounsel', 'followUp']),
    );
    expect(actions).not.toContain('resolve');
  });

  it('deja emitir el criterio a Orientación solo si hay una solicitud pendiente', () => {
    expect(availableCaseActions({ ...base, canReview: true })).not.toContain('issueCounsel');
    expect(availableCaseActions({ ...base, canReview: true, hasPendingCounselRequest: true })).toContain('issueCounsel');
    expect(
      availableCaseActions({ ...base, status: 'PENDING_RESOLUTION', isConductor: true }),
    ).toContain('resolve');
    expect(
      availableCaseActions({ ...base, status: 'FIRM', canReview: true, hasPendingCounselRequest: true }),
    ).not.toContain('issueCounsel');
  });

  it('deja anular a quien configura, incluso un expediente firme, y no uno desestimado', () => {
    expect(availableCaseActions({ ...base, status: 'FIRM', canConfigure: true })).toContain('annul');
    expect(availableCaseActions({ ...base, status: 'DISMISSED', canConfigure: true })).not.toContain('annul');
  });

  it('deja responder al docente que reportó', () => {
    expect(availableCaseActions({ ...base, isReporter: true })).toContain('respondInformation');
  });
});

describe('etiquetas del expediente', () => {
  it('traduce los eventos que la cronología mostraba en inglés', () => {
    expect(EVENT_LABELS.PRECAUTIONARY_ORDERED).toBe('Retiro precautorio');
    expect(EVENT_LABELS.DEFENSE_FILED).toBe('Descargo');
    expect(EVENT_LABELS.REVOCATION_FILED).toBe('Revocatoria');
  });

  it('reserva «en subsidio» para la apelación', () => {
    expect(appealHeading({ kind: 'REVOCATION', isSubsidiary: true })).toBe('Revocatoria con apelación en subsidio');
    expect(appealHeading({ kind: 'APPEAL', isSubsidiary: true })).toBe('Apelación en subsidio');
    expect(appealHeading({ kind: 'REVOCATION', isSubsidiary: false })).toBe('Revocatoria');
  });
});

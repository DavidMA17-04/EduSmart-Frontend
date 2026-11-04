import { describe, expect, it } from 'vitest';
import {
  APPEAL_TRACKING_COPY,
  appealDay,
  appealTrackingCaseHref,
  appealTrackingCopyIsScoped,
  appealTrackingHref,
  canConfirmAppealRead,
  historyHidesReserved,
  isProposedDeduction,
  openingMarksAppealRead,
  visibleAppealWitnesses,
} from './appealTracking';

describe('seguimiento de recursos', () => {
  it('no menciona comités, becas ni APE-', () => {
    expect(appealTrackingCopyIsScoped()).toBe(true);
    expect(APPEAL_TRACKING_COPY.noCommittee).not.toMatch(/comit[eé]/i);
  });

  it('abre el detalle del recurso y el expediente AM-', () => {
    expect(appealTrackingHref(3)).toBe('/admin/discipline/appeals/3');
    expect(appealTrackingCaseHref(11)).toBe('/admin/discipline/cases/11');
    expect(appealDay('2026-10-16T15:00:00.000Z')).toBe('2026-10-16');
  });

  it('abrir no confirma lectura y solo el destinatario puede confirmar', () => {
    expect(openingMarksAppealRead()).toBe(false);
    expect(canConfirmAppealRead({ communicationId: 4, issuedAt: '2026-10-17T12:00:00.000Z', notificationId: 9, readAt: null, canConfirm: true })).toBe(true);
    expect(canConfirmAppealRead({ communicationId: 4, issuedAt: '2026-10-17T12:00:00.000Z', notificationId: null, readAt: null, canConfirm: false })).toBe(false);
  });

  it('oculta testigos y criterio al encargado y muestra rebajo propuesto', () => {
    expect(visibleAppealWitnesses({ canSeeReserved: false }, 'Ana testigo')).toBeNull();
    expect(visibleAppealWitnesses({ canSeeReserved: true }, 'Ana testigo')).toBe('Ana testigo');
    expect(historyHidesReserved({ caseNumber: 'AM-2026-0001' })).toBe(true);
    expect(
      isProposedDeduction({
        caseStatus: 'IN_APPEAL',
        deductionState: 'PROPOSED',
        deductionLabel: 'Rebajo propuesto: 20 puntos',
      }),
    ).toBe(true);
  });
});

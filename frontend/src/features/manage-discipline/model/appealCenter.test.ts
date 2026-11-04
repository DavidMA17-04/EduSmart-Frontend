import { describe, expect, it, vi } from 'vitest';
import {
  APPEAL_CENTER_COPY,
  appealCenterCopyIsScoped,
  appealListHref,
  appealListKindLabel,
  appealOutcomeLabel,
  buildAppealPreview,
  canConfirmAppeal,
  canUseSubsidiary,
  createOnceGuard,
  draftFromEligible,
  previewMatchesDraft,
  submitAppealDraft,
  validateAppealDraft,
} from './appealCenter';
import type { EligibleDisciplinaryCase } from './types';

const eligible: EligibleDisciplinaryCase = {
  caseId: 11,
  caseNumber: 'AM-2026-0011',
  studentUserId: 10,
  studentFullName: 'Ana Mora',
  caseStatus: 'RESOLVED',
  track: 'DUE_PROCESS',
  kind: 'REVOCATION',
  dueOn: '2026-10-28',
  deadline: 'ON_TIME',
  stepBusinessDays: 3,
};

const body = 'Se interpone el recurso porque la medida no valora el descargo presentado.';

describe('Centro de apelaciones — alcance de copia', () => {
  it('no menciona becas, comités, APE- ni notas académicas', () => {
    expect(appealCenterCopyIsScoped()).toBe(true);
    expect(APPEAL_CENTER_COPY.title).toContain('apelaciones');
  });
});

describe('wizard de registro', () => {
  it('sin expediente elegible no se puede confirmar', () => {
    expect(validateAppealDraft(null)).toMatch(/expediente elegible/);
    expect(
      canConfirmAppeal({ step: 'preview', draft: null, eligibleCount: 0, pending: false }),
    ).toBe(false);
  });

  it('el resumen del elegible usa AM- y el tipo de Sprint 4, sin cédula', () => {
    const draft = draftFromEligible(eligible);
    expect(draft.caseNumber).toBe('AM-2026-0011');
    expect(draft.kind).toBe('REVOCATION');
    expect(JSON.stringify(draft)).not.toMatch(/cédula|cedula/i);
  });

  it('el subsidio solo aplica a la revocatoria', () => {
    expect(canUseSubsidiary('REVOCATION')).toBe(true);
    expect(canUseSubsidiary('APPEAL')).toBe(false);
    expect(draftFromEligible({ ...eligible, kind: 'APPEAL' }, body, true).subsidiary).toBe(false);
  });

  it('la vista previa coincide con el texto y el expediente que se enviarán', () => {
    const draft = draftFromEligible(eligible, body, true);
    const preview = buildAppealPreview(draft);
    expect(preview.caseNumber).toBe('AM-2026-0011');
    expect(preview.kindLabel).toBe('Revocatoria');
    expect(preview.subsidiary).toBe(true);
    expect(preview.body).toBe(body);
    expect(previewMatchesDraft(draft, preview)).toBe(true);
    expect(previewMatchesDraft(draft, { ...preview, body: 'otro texto' })).toBe(false);
  });

  it('revocatoria llama fileRevocation con subsidio y apelación no crea un POST suelto', async () => {
    const fileRevocation = vi.fn().mockResolvedValue({ id: 4 });
    const fileAppeal = vi.fn().mockResolvedValue({ id: 5 });
    await submitAppealDraft(draftFromEligible(eligible, body, true), { fileRevocation, fileAppeal });
    expect(fileRevocation).toHaveBeenCalledWith(11, body, true);
    expect(fileAppeal).not.toHaveBeenCalled();

    await submitAppealDraft(draftFromEligible({ ...eligible, kind: 'APPEAL' }, body, true), {
      fileRevocation,
      fileAppeal,
    });
    expect(fileAppeal).toHaveBeenCalledWith(11, body);
    expect(fileAppeal.mock.calls[0]).toHaveLength(2);
  });

  it('un segundo clic no vuelve a enviar mientras el primero está en curso', async () => {
    let resolveFirst: (value: { id: number }) => void = () => undefined;
    const fileRevocation = vi.fn(
      () =>
        new Promise<{ id: number }>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const once = createOnceGuard();
    const draft = draftFromEligible(eligible, body, false);
    const first = once(() => submitAppealDraft(draft, { fileRevocation, fileAppeal: vi.fn() }));
    const second = once(() => submitAppealDraft(draft, { fileRevocation, fileAppeal: vi.fn() }));
    expect(fileRevocation).toHaveBeenCalledTimes(1);
    resolveFirst({ id: 9 });
    await expect(first).resolves.toEqual({ id: 9 });
    await expect(second).resolves.toBeUndefined();
  });
});

describe('listado de recursos', () => {
  it('abre el expediente AM- y muestra subsidio o resultado', () => {
    expect(appealListHref(11)).toBe('/admin/discipline/appeals/11');
    expect(appealListKindLabel({ kind: 'REVOCATION', isSubsidiary: true })).toBe(
      'Revocatoria con apelación en subsidio',
    );
    expect(appealOutcomeLabel(null)).toBe('Pendiente');
    expect(appealOutcomeLabel('UPHOLD')).toBe('Rechaza');
  });
});

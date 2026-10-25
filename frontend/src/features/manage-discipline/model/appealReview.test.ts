import { describe, expect, it, vi } from 'vitest';
import { DISCIPLINE_REGISTER_PATH } from './disciplineRouting';
import {
  APPEAL_REVIEW_COPY,
  appealReviewCaseHref,
  appealReviewCopyIsScoped,
  appealReviewHref,
  canOfferPartialAccept,
  isForbiddenRevocationModify,
  reviewPageHasRegisterLink,
  reviewableOutcomes,
  submitReviewResolution,
} from './appealReview';

describe('revisión de recursos', () => {
  it('no menciona becas, comités, APE- ni registro de amonestación', () => {
    expect(appealReviewCopyIsScoped()).toBe(true);
    expect(APPEAL_REVIEW_COPY.title).toContain('recursos');
  });

  it('revocatoria no ofrece Acoge parcialmente y apelación sí', () => {
    expect(reviewableOutcomes('REVOCATION')).toEqual(['REVOKE', 'UPHOLD']);
    expect(canOfferPartialAccept('REVOCATION')).toBe(false);
    expect(isForbiddenRevocationModify('REVOCATION', 'MODIFY')).toBe(true);
    expect(canOfferPartialAccept('APPEAL')).toBe(true);
    expect(reviewableOutcomes('APPEAL')).toContain('MODIFY');
  });

  it('resolver reutiliza los POST de Sprint 4 y no llama /appeals', async () => {
    const resolveRevocation = vi.fn().mockResolvedValue({ id: 1 });
    const resolveAppeal = vi.fn().mockResolvedValue({ id: 2 });
    await submitReviewResolution('REVOCATION', { resolveRevocation, resolveAppeal }, 11, 4, {
      outcome: 'UPHOLD',
      reasoning: 'Se confirma la amonestación con el expediente y el descargo.',
    });
    expect(resolveRevocation).toHaveBeenCalledWith(11, 4, {
      outcome: 'UPHOLD',
      reasoning: 'Se confirma la amonestación con el expediente y el descargo.',
    });
    expect(resolveAppeal).not.toHaveBeenCalled();

    await expect(
      submitReviewResolution('REVOCATION', { resolveRevocation, resolveAppeal }, 11, 4, {
        outcome: 'MODIFY',
        reasoning: 'Intento de acoger parcialmente una revocatoria.',
      }),
    ).rejects.toThrow(/acoge o se rechaza/);
    expect(resolveRevocation).toHaveBeenCalledTimes(1);
  });

  it('la revisión abre el AM- y no ofrece registrar amonestación', () => {
    expect(appealReviewHref(9)).toBe('/admin/discipline/appeals/review/9');
    expect(appealReviewCaseHref(11)).toBe('/admin/discipline/cases/11');
    expect(reviewPageHasRegisterLink([appealReviewHref(9), appealReviewCaseHref(11)])).toBe(false);
    expect(reviewPageHasRegisterLink([DISCIPLINE_REGISTER_PATH])).toBe(true);
  });
});

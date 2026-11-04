import { DISCIPLINE_REGISTER_PATH, disciplineAppealReviewPath, disciplineCasePath } from './disciplineRouting';
import type { AppealKind, AppealOutcome } from './types';

export const APPEAL_REVIEW_COPY = {
  title: 'Revisión de recursos',
  subtitle: 'Resuelva las revocatorias y apelaciones pendientes de su instancia. La nota de conducta solo cambia cuando el acto queda firme.',
  empty: 'No hay recursos pendientes de su instancia.',
  detail: 'Revisar recurso',
  caseLink: 'Abrir expediente',
  noCommittee: 'La resolución usa el contrato de Disciplina, sin instancias adicionales.',
} as const;

const FORBIDDEN_REVIEW_TERMS = ['beca', 'becas', 'ape-', 'comité', 'comite', 'nota académica', 'registrar amonestación'];

export function appealReviewCopyIsScoped(copy: typeof APPEAL_REVIEW_COPY = APPEAL_REVIEW_COPY): boolean {
  const blob = Object.values(copy).join(' ').toLowerCase();
  return FORBIDDEN_REVIEW_TERMS.every((term) => !blob.includes(term));
}

export function reviewableOutcomes(kind: AppealKind): AppealOutcome[] {
  if (kind === 'REVOCATION') return ['REVOKE', 'UPHOLD'];
  return ['REVOKE', 'UPHOLD', 'MODIFY'];
}

export function canOfferPartialAccept(kind: AppealKind): boolean {
  return kind === 'APPEAL';
}

export function isForbiddenRevocationModify(kind: AppealKind, outcome: AppealOutcome): boolean {
  return kind === 'REVOCATION' && outcome === 'MODIFY';
}

export function submitReviewResolution(
  kind: AppealKind,
  api: {
    resolveRevocation: (caseId: number, appealId: number, input: { outcome: string; reasoning: string }) => Promise<unknown>;
    resolveAppeal: (
      caseId: number,
      appealId: number,
      input: { outcome: string; reasoning: string; severity?: string },
    ) => Promise<unknown>;
  },
  caseId: number,
  appealId: number,
  input: { outcome: AppealOutcome; reasoning: string; severity?: string },
) {
  if (isForbiddenRevocationModify(kind, input.outcome)) {
    return Promise.reject(new Error('La revocatoria se acoge o se rechaza'));
  }
  if (kind === 'REVOCATION') {
    return api.resolveRevocation(caseId, appealId, { outcome: input.outcome, reasoning: input.reasoning });
  }
  return api.resolveAppeal(caseId, appealId, input);
}

export function appealReviewHref(appealId: number): string {
  return disciplineAppealReviewPath(appealId);
}

export function appealReviewCaseHref(caseId: number): string {
  return disciplineCasePath(caseId);
}

export function reviewPageHasRegisterLink(hrefs: readonly string[]): boolean {
  return hrefs.some((href) => href === DISCIPLINE_REGISTER_PATH || href.startsWith(`${DISCIPLINE_REGISTER_PATH}/`));
}

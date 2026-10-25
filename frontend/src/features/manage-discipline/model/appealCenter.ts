import { validateGuardianText } from './guardianInbox';
import { appealHeading } from './caseActions';
import { disciplineAppealTrackingPath } from './disciplineRouting';
import type {
  AppealKind,
  AppealOutcome,
  DisciplinaryAppealListItem,
  EligibleDisciplinaryCase,
} from './types';

export const APPEAL_CENTER_COPY = {
  title: 'Centro de apelaciones',
  subtitle:
    'Consulte e interponga recursos de conducta sobre un expediente AM-. La nota de conducta solo cambia cuando el acto queda firme.',
  process:
    'Primero cabe la revocatoria ante quien dictó el acto. Si se rechaza, puede interponerse la apelación ante Dirección. También puede pedirse apelación en subsidio al presentar la revocatoria.',
  newAppeal: 'Nueva apelación',
  myAppeals: 'Mis recursos',
  noEligible: 'No hay actuaciones apelables en plazo.',
  selectHint: 'Elija un expediente elegible. No se piden de nuevo los datos ya registrados.',
  bodyHint: 'Fundamente el recurso con 10 a 4000 caracteres. No adjunte evidencias en este paso.',
  previewHint: 'Revise el texto que se enviará. Debe coincidir con lo que confirmará.',
} as const;

export const APPEAL_KIND_LABELS: Record<AppealKind, string> = {
  REVOCATION: 'Revocatoria',
  APPEAL: 'Apelación',
};

export const APPEAL_OUTCOME_LABELS: Record<AppealOutcome | 'PENDING', string> = {
  PENDING: 'Pendiente',
  UPHOLD: 'Rechaza',
  REVOKE: 'Acoge',
  MODIFY: 'Acoge parcialmente',
};

export type AppealWizardStep = 'select' | 'draft' | 'preview' | 'done';

export type AppealDraft = {
  caseId: number;
  caseNumber: string;
  kind: AppealKind;
  body: string;
  subsidiary: boolean;
  dueOn: string | null;
  stepBusinessDays: number;
  studentFullName: string;
};

export type AppealPreview = {
  caseNumber: string;
  kindLabel: string;
  studentFullName: string;
  subsidiary: boolean;
  subsidiaryLabel: string | null;
  body: string;
  dueOn: string | null;
};

export type AppealSubmitApi = {
  fileRevocation: (caseId: number, body: string, subsidiary: boolean) => Promise<{ id: number }>;
  fileAppeal: (caseId: number, body: string) => Promise<{ id: number }>;
};

const FORBIDDEN_CENTER_TERMS = ['beca', 'becas', 'ape-', 'comité', 'comite', 'nota académica', 'notas académicas'];

export function appealCenterCopyIsScoped(copy: typeof APPEAL_CENTER_COPY = APPEAL_CENTER_COPY): boolean {
  const blob = Object.values(copy).join(' ').toLowerCase();
  return FORBIDDEN_CENTER_TERMS.every((term) => !blob.includes(term));
}

export function appealOutcomeLabel(outcome: AppealOutcome | null): string {
  return APPEAL_OUTCOME_LABELS[outcome ?? 'PENDING'];
}

export function appealListHref(appealId: number): string {
  return disciplineAppealTrackingPath(appealId);
}

export function canUseSubsidiary(kind: AppealKind): boolean {
  return kind === 'REVOCATION';
}

export function draftFromEligible(row: EligibleDisciplinaryCase, body = '', subsidiary = false): AppealDraft {
  return {
    caseId: row.caseId,
    caseNumber: row.caseNumber,
    kind: row.kind,
    body,
    subsidiary: canUseSubsidiary(row.kind) ? subsidiary : false,
    dueOn: row.dueOn,
    stepBusinessDays: row.stepBusinessDays,
    studentFullName: row.studentFullName,
  };
}

export function validateAppealDraft(draft: AppealDraft | null): string | null {
  if (!draft) return 'Seleccione un expediente elegible.';
  return validateGuardianText(draft.body);
}

export function buildAppealPreview(draft: AppealDraft): AppealPreview {
  const heading = appealHeading({ kind: draft.kind, isSubsidiary: draft.subsidiary });
  return {
    caseNumber: draft.caseNumber,
    kindLabel: APPEAL_KIND_LABELS[draft.kind],
    studentFullName: draft.studentFullName,
    subsidiary: canUseSubsidiary(draft.kind) && draft.subsidiary,
    subsidiaryLabel: canUseSubsidiary(draft.kind) && draft.subsidiary ? heading : null,
    body: draft.body.trim(),
    dueOn: draft.dueOn,
  };
}

export function previewMatchesDraft(draft: AppealDraft, preview: AppealPreview): boolean {
  const expected = buildAppealPreview(draft);
  return (
    expected.caseNumber === preview.caseNumber &&
    expected.kindLabel === preview.kindLabel &&
    expected.subsidiary === preview.subsidiary &&
    expected.body === preview.body
  );
}

export function canConfirmAppeal(input: {
  step: AppealWizardStep;
  draft: AppealDraft | null;
  eligibleCount: number;
  pending: boolean;
}): boolean {
  if (input.pending || input.step !== 'preview' || input.eligibleCount === 0) return false;
  return validateAppealDraft(input.draft) === null;
}

export async function submitAppealDraft(draft: AppealDraft, api: AppealSubmitApi): Promise<{ id: number }> {
  const problem = validateAppealDraft(draft);
  if (problem) throw new Error(problem);
  const body = draft.body.trim();
  if (draft.kind === 'REVOCATION') {
    return api.fileRevocation(draft.caseId, body, draft.subsidiary);
  }
  return api.fileAppeal(draft.caseId, body);
}

export function createOnceGuard() {
  let pending = false;
  return async <T>(work: () => Promise<T>): Promise<T | undefined> => {
    if (pending) return undefined;
    pending = true;
    try {
      return await work();
    } finally {
      pending = false;
    }
  };
}

export function appealListKindLabel(row: Pick<DisciplinaryAppealListItem, 'kind' | 'isSubsidiary'>): string {
  return appealHeading(row);
}

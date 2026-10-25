import { disciplineCasePath, disciplineAppealTrackingPath } from './disciplineRouting';
import type { AppealResolutionNotice, DisciplinaryAppealListItem, DisciplinaryAppealTracking } from './types';

export const APPEAL_TRACKING_COPY = {
  title: 'Seguimiento del recurso',
  subtitle: 'Cronología e historial del recurso sobre el expediente AM-. La nota de conducta solo cambia cuando el acto queda firme.',
  timeline: 'Cronología',
  history: 'Historial de recursos',
  historyHint: 'Consulte los recursos autorizados del estudiante, con acceso al detalle y a la cronología.',
  confirmRead: 'Confirmo lectura',
  alreadyRead: 'Lectura confirmada',
  openDoesNotRead: 'Abrir esta pantalla no confirma la lectura.',
  physical: 'No hay encargado vinculado. La entrega física sigue las reglas del expediente.',
  noCommittee: 'El seguimiento muestra los acontecimientos reales del recurso, sin instancias adicionales.',
  caseLink: 'Abrir expediente',
  back: 'Volver al Centro',
} as const;

const FORBIDDEN_TRACKING_TERMS = ['beca', 'becas', 'ape-', 'comité', 'comite', 'nota académica', 'criterio reservado'];

export function appealTrackingCopyIsScoped(copy: typeof APPEAL_TRACKING_COPY = APPEAL_TRACKING_COPY): boolean {
  const blob = Object.values(copy).join(' ').toLowerCase();
  return FORBIDDEN_TRACKING_TERMS.every((term) => !blob.includes(term));
}

export function appealTrackingHref(appealId: number): string {
  return disciplineAppealTrackingPath(appealId);
}

export function appealTrackingCaseHref(caseId: number): string {
  return disciplineCasePath(caseId);
}

export function appealDay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

export function canConfirmAppealRead(notice: AppealResolutionNotice | null | undefined): boolean {
  return Boolean(notice?.canConfirm && notice.notificationId);
}

export function openingMarksAppealRead(): boolean {
  return false;
}

export function visibleAppealWitnesses(
  actor: { canSeeReserved: boolean },
  witnesses: string | null,
): string | null {
  return actor.canSeeReserved ? witnesses : null;
}

export function historyHidesReserved(row: Pick<DisciplinaryAppealListItem, 'caseNumber'> & { witnesses?: string | null; reservedCriteria?: string | null }): boolean {
  return !('witnesses' in row) && !('reservedCriteria' in row) && Boolean(row.caseNumber);
}

export function isProposedDeduction(row: Pick<DisciplinaryAppealTracking, 'deductionState' | 'caseStatus' | 'deductionLabel'>): boolean {
  if (row.deductionState) return row.deductionState === 'PROPOSED';
  return row.caseStatus === 'IN_APPEAL' || Boolean(row.deductionLabel?.toLowerCase().includes('propuesto'));
}

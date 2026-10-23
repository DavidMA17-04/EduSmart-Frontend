import type { DisciplinaryCaseStatus, DisciplinaryTrack } from './types';

export type CaseAction =
  | 'investigate'
  | 'observe'
  | 'requestInformation'
  | 'respondInformation'
  | 'requestCounsel'
  | 'issueCounsel'
  | 'communicate'
  | 'resolve'
  | 'archive'
  | 'annul'
  | 'followUp';

const FINAL_STATUSES = new Set<DisciplinaryCaseStatus>(['FIRM', 'DISMISSED', 'ANNULLED']);

export const CASE_ACTION_LABELS: Record<CaseAction, string> = {
  investigate: 'Iniciar investigación',
  observe: 'Registrar observación',
  requestInformation: 'Solicitar información',
  respondInformation: 'Responder solicitud',
  requestCounsel: 'Solicitar criterio',
  issueCounsel: 'Emitir criterio',
  communicate: 'Comunicar el cargo',
  resolve: 'Resolver',
  archive: 'Archivar por falta de mérito',
  annul: 'Anular',
  followUp: 'Registrar seguimiento',
};

export function availableCaseActions(input: {
  status: DisciplinaryCaseStatus;
  track: DisciplinaryTrack;
  isConductor: boolean;
  isReporter: boolean;
  canReview: boolean;
  canConfigure: boolean;
  canFollowUp: boolean;
  hasPendingCounselRequest?: boolean;
}): CaseAction[] {
  const actions: CaseAction[] = [];
  const due = input.track === 'DUE_PROCESS';
  const open = !FINAL_STATUSES.has(input.status);
  if (due && input.status === 'REPORTED' && input.isConductor) actions.push('investigate');
  if (due && input.status === 'INVESTIGATING' && input.isConductor) {
    actions.push('observe', 'requestInformation', 'communicate', 'archive');
  }
  if (due && input.status === 'INVESTIGATING' && input.isReporter) actions.push('respondInformation');
  if (due && open && input.isConductor) actions.push('requestCounsel');
  if (due && open && input.canReview && input.hasPendingCounselRequest) actions.push('issueCounsel');
  if (due && input.status === 'PENDING_RESOLUTION' && input.isConductor) actions.push('resolve');
  if (input.canConfigure && input.status !== 'ANNULLED' && input.status !== 'DISMISSED') actions.push('annul');
  if (input.canFollowUp) actions.push('followUp');
  return actions;
}

export const EVENT_LABELS: Record<string, string> = {
  CASE_OPENED: 'Apertura',
  STATUS_CHANGE: 'Cambio de estado',
  OBSERVATION: 'Observación',
  INFO_REQUEST: 'Solicitud de información',
  INFO_RESPONSE: 'Respuesta del docente',
  COUNSEL_REQUEST: 'Solicitud de criterio',
  COUNSEL_OPINION: 'Criterio de Orientación',
  PRECAUTIONARY_ORDERED: 'Retiro precautorio',
  DEFENSE_FILED: 'Descargo',
  REVOCATION_FILED: 'Revocatoria',
  APPEAL_FILED: 'Apelación',
  REVOCATION_RESOLVED: 'Revocatoria resuelta',
  PHYSICAL_DELIVERY: 'Entrega física',
  FOLLOW_UP: 'Seguimiento',
  FOLLOW_UP_OUTCOME: 'Resultado del compromiso',
  FOLLOW_UP_REMINDER: 'Recordatorio de revisión',
  SUBSIDIARY_ELEVATED: 'Apelación elevada',
};

export function appealHeading(item: { kind: string; isSubsidiary: boolean }): string {
  if (item.kind === 'APPEAL') return item.isSubsidiary ? 'Apelación en subsidio' : 'Apelación';
  return item.isSubsidiary ? 'Revocatoria con apelación en subsidio' : 'Revocatoria';
}

export const FOLLOW_UP_KIND_LABELS: Record<string, string> = {
  STUDENT_INTERVIEW: 'Entrevista con el estudiante',
  GUARDIAN_MEETING: 'Reunión con el encargado',
  COMMITMENT: 'Compromiso',
  CORRECTIVE_ACTION: 'Acción correctiva',
  OBSERVATION: 'Observación',
};

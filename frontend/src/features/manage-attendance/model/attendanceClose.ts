import type {
  AttendanceSessionDetail,
  AttendanceSessionMutationResult,
  AttendanceSessionStatus,
} from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import {
  isAttendanceSessionNotOpenError,
  type AttendanceSummaryCounts,
} from './attendanceDraft';

export type AttendanceFinalizeOutcome =
  | 'noop'
  | 'save_failed'
  | 'session_closed'
  | 'close_failed'
  | 'finalized'
  | 'finalized_refresh_failed'
  | 'already_closed';

export function getFinalizeButtonState(input: {
  sessionStatus: AttendanceSessionStatus | null | undefined;
  canEdit: boolean;
  saving: boolean;
  closing: boolean;
}): { visible: boolean; enabled: boolean; label: string } {
  const visible = input.sessionStatus === 'OPEN' && input.canEdit;
  return {
    visible,
    enabled: visible && !input.saving && !input.closing,
    label: input.closing ? 'Finalizando…' : 'Finalizar clase',
  };
}

export function buildFinalizeConfirmCopy(input: {
  dirtyCount: number;
  unmarkedCount: number;
}): {
  requiresSave: boolean;
  confirmLabel: string;
  primaryCopy: string;
  dirtyWarning: string | null;
  unmarkedWarning: string | null;
} {
  const requiresSave = input.dirtyCount > 0;
  const unmarkedWarning =
    input.unmarkedCount > 0
      ? `Hay ${input.unmarkedCount} estudiante${
          input.unmarkedCount === 1 ? '' : 's'
        } sin registrar. Si finalizas la clase, permanecerán sin marca.`
      : null;

  const dirtyWarning = requiresSave
    ? 'Tienes cambios sin guardar. Se guardarán antes de finalizar la clase.'
    : null;

  const primaryCopy = requiresSave
    ? 'Se guardarán los cambios pendientes y luego se finalizará la clase. Después no podrás modificar la asistencia desde esta pantalla.'
    : '¿Deseas finalizar esta clase? Después de finalizarla no podrás modificar la asistencia desde esta pantalla.';

  return {
    requiresSave,
    confirmLabel: requiresSave ? 'Guardar y finalizar' : 'Finalizar clase',
    primaryCopy,
    dirtyWarning,
    unmarkedWarning,
  };
}

/** Close never invents ABSENT for unmarked students. */
export function closeCreatesAbsentForUnmarked(): false {
  return false;
}

export function isAttendanceSessionAlreadyClosedError(
  reason: unknown,
): boolean {
  if (!(reason instanceof HttpError)) return false;
  const message = reason.message ?? '';
  return (
    message.includes('ATTENDANCE_SESSION_ALREADY_CLOSED') ||
    /already CLOSED/i.test(message) ||
    isAttendanceSessionNotOpenError(reason)
  );
}

export function applyClosedSessionLocally(
  session: AttendanceSessionDetail,
  mutation: Pick<AttendanceSessionMutationResult, 'status' | 'closedAt'>,
): AttendanceSessionDetail {
  const closedAt =
    mutation.closedAt == null
      ? session.closedAt
      : typeof mutation.closedAt === 'string'
        ? mutation.closedAt
        : new Date(mutation.closedAt).toISOString();

  return {
    ...session,
    status: mutation.status === 'CLOSED' ? 'CLOSED' : 'CLOSED',
    closedAt,
  };
}

export function shouldContinueCloseAfterSave(
  outcome: 'saved' | 'saved_refresh_failed' | 'error' | 'session_closed' | 'noop',
): boolean {
  return outcome === 'saved' || outcome === 'saved_refresh_failed' || outcome === 'noop';
}

export function formatFinalizeSummaryLines(
  summary: AttendanceSummaryCounts,
): string[] {
  return [
    `Presentes: ${summary.present}`,
    `Ausentes: ${summary.absent}`,
    `Tardías: ${summary.late}`,
    `Sin marcar: ${summary.unmarked}`,
  ];
}

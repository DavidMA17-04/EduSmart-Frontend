import type {
  AttendanceScheduleContext,
  AttendanceScheduleOccurrence,
} from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import type { MyScheduleCardVariant } from './mySchedulePresentation';

export type MyScheduleAttendanceCtaKind = 'take' | 'continue' | 'view';

export type MyScheduleAttendanceCta = {
  kind: MyScheduleAttendanceCtaKind;
  label: string;
  /** Shown above the action for CLOSED. */
  badgeLabel?: string;
  sessionId?: number;
  scheduleEntryId?: number;
};

export const MY_SCHEDULE_ATTENDANCE_COPY = {
  take: 'Tomar asistencia',
  continue: 'Continuar asistencia',
  view: 'Ver asistencia',
  registered: '✓ Asistencia registrada',
  contextFailed: 'No se pudo cargar el estado de asistencia.',
  startFailed: 'No se pudo iniciar la asistencia.',
  wrongDay: 'Esta clase no corresponde al día de hoy.',
  outsideWindow:
    'La asistencia solo puede iniciarse desde 10 minutos antes y durante la clase.',
  notClass: 'Este bloque no corresponde a una clase.',
} as const;

/** Index every entryId in a run → occurrence (same session state). */
export function indexOccurrencesByEntryId(
  context: AttendanceScheduleContext | null | undefined,
): Map<number, AttendanceScheduleOccurrence> {
  const map = new Map<number, AttendanceScheduleOccurrence>();
  for (const occurrence of context?.occurrences ?? []) {
    for (const entryId of occurrence.entryIds) {
      map.set(entryId, occurrence);
    }
  }
  return map;
}

/**
 * CTA only on the anchor card of a run.
 * Student / missing permissions / unknown context → null.
 */
export function resolveMyScheduleAttendanceCta(input: {
  entryId: number;
  variant: MyScheduleCardVariant;
  canViewAttendance: boolean;
  canCreateAttendance: boolean;
  occurrence: AttendanceScheduleOccurrence | null | undefined;
}): MyScheduleAttendanceCta | null {
  if (input.variant !== 'teacher') return null;
  const occurrence = input.occurrence;
  if (!occurrence) return null;
  if (occurrence.anchorEntryId !== input.entryId) return null;

  const session = occurrence.attendanceSession;
  if (session?.status === 'OPEN' && input.canViewAttendance) {
    return {
      kind: 'continue',
      label: MY_SCHEDULE_ATTENDANCE_COPY.continue,
      sessionId: session.id,
    };
  }
  if (session?.status === 'CLOSED' && input.canViewAttendance) {
    return {
      kind: 'view',
      label: MY_SCHEDULE_ATTENDANCE_COPY.view,
      badgeLabel: MY_SCHEDULE_ATTENDANCE_COPY.registered,
      sessionId: session.id,
    };
  }
  if (
    session == null &&
    occurrence.withinStartWindow &&
    input.canCreateAttendance
  ) {
    return {
      kind: 'take',
      label: MY_SCHEDULE_ATTENDANCE_COPY.take,
      scheduleEntryId: occurrence.anchorEntryId,
    };
  }
  return null;
}

export function shouldFetchAttendanceScheduleContext(input: {
  variant: MyScheduleCardVariant;
  canViewAttendance: boolean;
}): boolean {
  return input.variant === 'teacher' && input.canViewAttendance;
}

export function humanizeFromScheduleError(error: unknown): string {
  const msg =
    error instanceof HttpError
      ? error.message
      : error instanceof Error
        ? error.message
        : '';
  const upper = String(msg).toUpperCase();
  if (upper.includes('ATTENDANCE_SCHEDULE_WRONG_DAY')) {
    return MY_SCHEDULE_ATTENDANCE_COPY.wrongDay;
  }
  if (upper.includes('ATTENDANCE_OUTSIDE_SCHEDULE_WINDOW')) {
    return MY_SCHEDULE_ATTENDANCE_COPY.outsideWindow;
  }
  if (upper.includes('ATTENDANCE_SCHEDULE_ENTRY_NOT_CLASS')) {
    return MY_SCHEDULE_ATTENDANCE_COPY.notClass;
  }
  if (error instanceof HttpError && error.message) return error.message;
  return MY_SCHEDULE_ATTENDANCE_COPY.startFailed;
}

export function buildFromSchedulePayload(scheduleEntryId: number): {
  scheduleEntryId: number;
} {
  return { scheduleEntryId };
}

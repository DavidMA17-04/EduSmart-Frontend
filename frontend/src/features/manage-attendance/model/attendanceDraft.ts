import type {
  AttendanceRosterStudent,
  AttendanceSessionStatus,
  AttendanceStatus,
  SaveAttendanceRecordInput,
  SaveAttendanceRecordsInput,
} from '@/entities/attendance';
import { HttpError } from '@/shared/api';

export type DraftStatus = AttendanceStatus | null;

export type AttendanceDraftMap = Record<number, DraftStatus>;

export type AttendanceSummaryCounts = {
  present: number;
  absent: number;
  late: number;
  unmarked: number;
  total: number;
};

export type AttendanceSaveOutcome =
  | 'noop'
  | 'saved'
  | 'saved_refresh_failed'
  | 'error'
  | 'session_closed';

export const ATTENDANCE_STATUS_OPTIONS: Array<{
  value: AttendanceStatus;
  label: string;
}> = [
  { value: 'PRESENT', label: 'Presente' },
  { value: 'ABSENT', label: 'Ausente' },
  { value: 'LATE', label: 'Tarde' },
];

export function buildInitialDraft(
  roster: AttendanceRosterStudent[],
): AttendanceDraftMap {
  const draft: AttendanceDraftMap = {};
  for (const row of roster) {
    draft[row.userId] = row.attendance?.status ?? null;
  }
  return draft;
}

export function cloneDraft(draft: AttendanceDraftMap): AttendanceDraftMap {
  return { ...draft };
}

export function setStudentDraftStatus(
  draft: AttendanceDraftMap,
  userId: number,
  status: DraftStatus,
): AttendanceDraftMap {
  return { ...draft, [userId]: status };
}

export function isStudentDirty(
  initial: AttendanceDraftMap,
  draft: AttendanceDraftMap,
  userId: number,
): boolean {
  return (draft[userId] ?? null) !== (initial[userId] ?? null);
}

export function collectDirtyStudentIds(
  initial: AttendanceDraftMap,
  draft: AttendanceDraftMap,
  studentIds: number[],
): number[] {
  return studentIds.filter((id) => isStudentDirty(initial, draft, id));
}

export function summarizeDraft(
  draft: AttendanceDraftMap,
  studentIds: number[],
): AttendanceSummaryCounts {
  const counts: AttendanceSummaryCounts = {
    present: 0,
    absent: 0,
    late: 0,
    unmarked: 0,
    total: studentIds.length,
  };

  for (const id of studentIds) {
    const status = draft[id] ?? null;
    if (status === 'PRESENT') counts.present += 1;
    else if (status === 'ABSENT') counts.absent += 1;
    else if (status === 'LATE') counts.late += 1;
    else counts.unmarked += 1;
  }

  return counts;
}

export function filterRosterByQuery(
  roster: AttendanceRosterStudent[],
  query: string,
): AttendanceRosterStudent[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return roster;
  return roster.filter((row) => {
    const name = row.fullName.toLowerCase();
    const nationalId = row.nationalId.toLowerCase();
    return name.includes(normalized) || nationalId.includes(normalized);
  });
}

export function isAttendanceSessionReadOnly(
  status: AttendanceSessionStatus | null | undefined,
): boolean {
  return status === 'CLOSED';
}

export function isAttendanceSessionEditable(input: {
  sessionStatus: AttendanceSessionStatus | null | undefined;
  canEdit: boolean;
}): boolean {
  return input.sessionStatus === 'OPEN' && input.canEdit;
}

/** Apply status change only when session is editable. Never clears to null. */
export function applyDraftStatusChange(input: {
  sessionStatus: AttendanceSessionStatus;
  canEdit: boolean;
  draft: AttendanceDraftMap;
  userId: number;
  nextStatus: AttendanceStatus;
}): AttendanceDraftMap {
  if (
    !isAttendanceSessionEditable({
      sessionStatus: input.sessionStatus,
      canEdit: input.canEdit,
    })
  ) {
    return input.draft;
  }
  return setStudentDraftStatus(input.draft, input.userId, input.nextStatus);
}

/**
 * Dirty records only, roster order, never `null`.
 * Backend accepts PRESENT | ABSENT | LATE exclusively.
 */
export function buildDirtyAttendancePayload(
  roster: AttendanceRosterStudent[],
  initial: AttendanceDraftMap,
  draft: AttendanceDraftMap,
): SaveAttendanceRecordsInput {
  const records: SaveAttendanceRecordInput[] = [];
  for (const row of roster) {
    const next = draft[row.userId] ?? null;
    const prev = initial[row.userId] ?? null;
    if (next === prev) continue;
    if (next == null) continue;
    records.push({ studentUserId: row.userId, status: next });
  }
  return { records };
}

export function canSaveAttendanceChanges(input: {
  sessionStatus: AttendanceSessionStatus | null | undefined;
  canEdit: boolean;
  dirtyCount: number;
  saving: boolean;
  closing?: boolean;
}): boolean {
  return (
    isAttendanceSessionEditable({
      sessionStatus: input.sessionStatus,
      canEdit: input.canEdit,
    }) &&
    input.dirtyCount > 0 &&
    !input.saving &&
    !input.closing
  );
}

export function getSaveButtonState(input: {
  sessionStatus: AttendanceSessionStatus | null | undefined;
  canEdit: boolean;
  dirtyCount: number;
  saving: boolean;
  closing?: boolean;
}): { visible: boolean; enabled: boolean; label: string } {
  const visible = input.sessionStatus === 'OPEN' && input.canEdit;
  return {
    visible,
    enabled: canSaveAttendanceChanges(input),
    label: input.saving ? 'Guardando…' : 'Guardar cambios',
  };
}

export function isAttendanceSessionNotOpenError(reason: unknown): boolean {
  if (!(reason instanceof HttpError)) return false;
  const message = reason.message ?? '';
  return (
    message.includes('ATTENDANCE_SESSION_NOT_OPEN') ||
    /only be modified while session is OPEN/i.test(message)
  );
}

/** After PUT OK when roster refresh fails — align maps with saved rows. */
export function reconcileDraftAfterSave(
  initial: AttendanceDraftMap,
  draft: AttendanceDraftMap,
  saved: Array<{ studentUserId: number; status: AttendanceStatus }>,
): { initial: AttendanceDraftMap; draft: AttendanceDraftMap } {
  const nextInitial = { ...initial };
  const nextDraft = { ...draft };
  for (const row of saved) {
    nextInitial[row.studentUserId] = row.status;
    nextDraft[row.studentUserId] = row.status;
  }
  return { initial: nextInitial, draft: nextDraft };
}

export function sessionStatusLabel(
  status: AttendanceSessionStatus,
): string {
  return status === 'CLOSED' ? 'Finalizada' : 'En curso';
}

export function formatSessionDateLabel(sessionDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sessionDate);
  if (!match) return sessionDate;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

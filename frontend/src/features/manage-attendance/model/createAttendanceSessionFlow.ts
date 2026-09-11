import type {
  AttendanceGroup,
  AttendanceSessionMutationResult,
  CreateAttendanceSessionInput,
} from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import { ATTENDANCE_SESSION_PATH } from './attendanceRouting';

const GRADE_LABELS: Record<number, string> = {
  7: 'Séptimo',
  8: 'Octavo',
  9: 'Noveno',
  10: 'Décimo',
  11: 'Undécimo',
  12: 'Duodécimo',
};

/** Display-only; does not drive offering eligibility. */
export function gradeLevelLabel(gradeLevel: number): string {
  return GRADE_LABELS[gradeLevel] ?? `Grado ${gradeLevel}`;
}

export function formatAttendanceGroupOptionLabel(group: AttendanceGroup): string {
  return `${group.name} · ${gradeLevelLabel(group.gradeLevel)}`;
}

export function buildCreateAttendanceSessionPayload(
  groupId: number | null,
  teachingAssignmentId: number | null,
): CreateAttendanceSessionInput | null {
  if (groupId == null || teachingAssignmentId == null) return null;
  if (!Number.isInteger(groupId) || groupId <= 0) return null;
  if (!Number.isInteger(teachingAssignmentId) || teachingAssignmentId <= 0) {
    return null;
  }
  return { groupId, teachingAssignmentId };
}

export function canSubmitCreateAttendanceSession(input: {
  groupId: number | null;
  teachingAssignmentId: number | null;
  groupsLoading: boolean;
  offeringsLoading: boolean;
  creating: boolean;
}): boolean {
  if (input.groupsLoading || input.offeringsLoading || input.creating) {
    return false;
  }
  return (
    buildCreateAttendanceSessionPayload(
      input.groupId,
      input.teachingAssignmentId,
    ) != null
  );
}

/** Prefer mutation `id` — create does not return `sessionId`. */
export function resolveSessionPathAfterCreate(
  result: Pick<AttendanceSessionMutationResult, 'id'> & {
    sessionId?: number;
  },
): string {
  return ATTENDANCE_SESSION_PATH(result.id);
}

export function shouldApplyOfferingsResponse(
  requestId: number,
  latestRequestId: number,
): boolean {
  return requestId === latestRequestId;
}

export function flowErrorMessage(reason: unknown, fallback: string): string {
  if (reason instanceof HttpError) return reason.message;
  if (reason instanceof Error && reason.message) return reason.message;
  return fallback;
}

/** UI branch for offerings panel (error ≠ empty). */
export function offeringsPanelState(input: {
  selectedGroupId: number | null;
  loading: boolean;
  error: string | null;
  offeringsCount: number;
}): 'idle' | 'loading' | 'error' | 'empty' | 'ready' {
  if (input.selectedGroupId == null) return 'idle';
  if (input.loading) return 'loading';
  if (input.error) return 'error';
  if (input.offeringsCount === 0) return 'empty';
  return 'ready';
}

/** Selecting a group always clears the previous offering. */
export function selectionAfterGroupChange(groupId: number | null): {
  selectedGroupId: number | null;
  selectedTeachingAssignmentId: null;
} {
  return {
    selectedGroupId: groupId,
    selectedTeachingAssignmentId: null,
  };
}

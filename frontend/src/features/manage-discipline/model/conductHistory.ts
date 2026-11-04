import { historyQuery } from '@/entities/discipline/model/queries';
import type { HistoryStudentOption } from './types';

export { historyQuery };

export type HistoryAudience = 'student' | 'guardian' | 'staff';

/** El estudiante siempre consulta el suyo. El encargado solo uno de sus representados. */
export function resolveHistoryStudent(input: {
  audience: HistoryAudience;
  sessionUserId: number;
  requestedStudentId: number | null;
  allowedStudentIds: readonly number[];
}): { studentId: number | null; blocked: boolean } {
  if (input.audience === 'student') {
    return { studentId: input.sessionUserId, blocked: false };
  }
  if (input.audience === 'guardian') {
    const allowed = new Set(input.allowedStudentIds);
    if (input.requestedStudentId != null) {
      return allowed.has(input.requestedStudentId)
        ? { studentId: input.requestedStudentId, blocked: false }
        : { studentId: null, blocked: true };
    }
    if (allowed.size === 1) {
      return { studentId: [...allowed][0] ?? null, blocked: false };
    }
    return { studentId: null, blocked: false };
  }
  return { studentId: input.requestedStudentId, blocked: false };
}

export function titleCasePersonName(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('es') + word.slice(1).toLocaleLowerCase('es'))
    .join(' ');
}

export function mergeHistoryStudents(
  ...groups: Array<readonly HistoryStudentOption[]>
): HistoryStudentOption[] {
  const byId = new Map<number, HistoryStudentOption>();
  for (const group of groups) {
    for (const student of group) {
      if (!byId.has(student.id)) byId.set(student.id, student);
    }
  }
  return [...byId.values()].sort((left, right) => left.fullName.localeCompare(right.fullName, 'es'));
}

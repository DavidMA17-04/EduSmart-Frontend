import type { ScheduleEntry } from '@/entities/schedule';
import {
  ADMIN_ROLE_NAME,
  STUDENT_ROLE_NAME,
  TEACHER_ROLE_NAME,
} from '@/entities/role';

/** Presentation-only card layout. Does not affect API scope. */
export type MyScheduleCardVariant = 'teacher' | 'student';

function roleMatches(role: string, ...candidates: string[]): boolean {
  const value = String(role).trim();
  const lower = value.toLowerCase();
  return candidates.some((c) => c === value || c.toLowerCase() === lower);
}

export function sessionHasTeacherRole(roles: readonly string[]): boolean {
  return roles.some((role) =>
    roleMatches(role, TEACHER_ROLE_NAME, 'Docente', 'TEACHER'),
  );
}

export function sessionHasStudentRole(roles: readonly string[]): boolean {
  return roles.some((role) =>
    roleMatches(role, STUDENT_ROLE_NAME, 'Estudiante', 'STUDENT'),
  );
}

export function sessionHasAdminRole(roles: readonly string[]): boolean {
  return roles.some((role) =>
    roleMatches(role, ADMIN_ROLE_NAME, 'Administrador', 'ADMIN'),
  );
}

/**
 * Mirrors backend E1 dual-role priority for presentation only:
 * Docente (+ Admin) → teacher card; Docente+Estudiante → teacher; Estudiante → student.
 */
export function resolveMyScheduleCardVariant(
  roles: readonly string[],
): MyScheduleCardVariant {
  if (sessionHasTeacherRole(roles) || sessionHasAdminRole(roles)) {
    return 'teacher';
  }
  if (sessionHasStudentRole(roles)) {
    return 'student';
  }
  return 'teacher';
}

export function resolveMyScheduleEntrySecondaryLabel(
  entry: ScheduleEntry,
  variant: MyScheduleCardVariant,
): string {
  const ta = entry.teachingAssignment;
  if (variant === 'student') {
    return ta.teacher.name;
  }
  return ta.group.name;
}

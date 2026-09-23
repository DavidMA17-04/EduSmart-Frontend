import { getSessionUser } from './session';

function roleMatches(role: string, ...candidates: string[]): boolean {
  const value = String(role).trim();
  const lower = value.toLowerCase();
  return candidates.some((c) => c === value || c.toLowerCase() === lower);
}

/** True when session has Docente/TEACHER and does not have Administrador/ADMIN. */
export function isTeacherWithoutAdminAccess(
  roles?: readonly string[],
): boolean {
  const effective = roles ?? getSessionUser()?.roles ?? [];
  if (!effective.length) return false;
  const isTeacher = effective.some((role) =>
    roleMatches(role, 'TEACHER', 'Docente'),
  );
  if (!isTeacher) return false;
  const isAdmin = effective.some((role) =>
    roleMatches(role, 'ADMIN', 'Administrador'),
  );
  return !isAdmin;
}

/** Teachers only see ACTIVE cursos lectivos; admins see full history. */
export function filterPeriodsForSessionRole<
  T extends { status?: string },
>(periods: T[], roles?: readonly string[]): T[] {
  if (!isTeacherWithoutAdminAccess(roles)) return periods;
  return periods.filter((p) => p.status === 'ACTIVE');
}

/** Teachers should not see year-history selectors. */
export function canBrowseAcademicYearHistory(roles?: readonly string[]): boolean {
  return !isTeacherWithoutAdminAccess(roles);
}

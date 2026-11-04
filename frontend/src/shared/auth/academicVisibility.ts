import { getSessionUser } from './session';

function roleMatches(role: string, ...candidates: string[]): boolean {
  const value = String(role).trim();
  const lower = value.toLowerCase();
  return candidates.some((c) => c === value || c.toLowerCase() === lower);
}

function sessionRoles(roles?: readonly string[]): readonly string[] {
  return roles ?? getSessionUser()?.roles ?? [];
}

/** True when session has Docente/TEACHER and does not have Administrador/ADMIN. */
export function isTeacherWithoutAdminAccess(
  roles?: readonly string[],
): boolean {
  const effective = sessionRoles(roles);
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

/** Only Administrador and Director may browse previous academic cycles. */
export function canBrowseAcademicYearHistory(roles?: readonly string[]): boolean {
  return sessionRoles(roles).some((role) =>
    roleMatches(role, 'ADMIN', 'Administrador', 'Director'),
  );
}

/** Non-admin/director sessions only see ACTIVE cursos lectivos. */
export function filterPeriodsForSessionRole<
  T extends { status?: string },
>(periods: T[], roles?: readonly string[]): T[] {
  if (canBrowseAcademicYearHistory(roles)) return periods;
  return periods.filter((p) => p.status === 'ACTIVE');
}

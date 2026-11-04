import type { AdministrativeUser, OwnEnrollment, UserAccountStatus } from '@/entities/user';
import type { StatusTone } from '@/shared/ui';

const STUDENT_ROLE_ALIASES = new Set(['estudiante', 'student']);

export function userHasStudentRole(user: Pick<AdministrativeUser, 'roles'> | null | undefined): boolean {
  return (user?.roles ?? []).some((role) => STUDENT_ROLE_ALIASES.has(role.name.trim().toLowerCase()));
}

export function userStatusTone(status: UserAccountStatus | string): StatusTone {
  if (status === 'ACTIVE') return 'active';
  if (status === 'BLOCKED') return 'danger';
  if (status === 'INACTIVE') return 'inactive';
  return 'pending';
}

export function formatRoleNames(user: Pick<AdministrativeUser, 'roles'> | null | undefined): string {
  const names = (user?.roles ?? []).map((role) => role.name).filter(Boolean);
  return names.length > 0 ? names.join(', ') : 'Sin roles';
}

export function enrollmentSummary(enrollment: OwnEnrollment | null | undefined): string {
  if (!enrollment) return 'Sin sección asignada';
  const section = enrollment.sectionLabel?.trim() || enrollment.groupName?.trim();
  const period = enrollment.academicPeriodName?.trim();
  if (section && period) return `${section} · ${period}`;
  if (section) return section;
  if (period) return period;
  return 'Sin sección asignada';
}

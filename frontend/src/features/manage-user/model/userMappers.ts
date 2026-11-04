import type { AdministrativeUser, OwnEnrollment, UserAccountStatus } from '@/entities/user';
import type { UserFormValues } from './useUserForm';

type RawUser = Partial<AdministrativeUser> & {
  national_id?: string | null;
  first_lastname?: string | null;
  second_lastname?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

function normalizeEnrollment(raw: OwnEnrollment | null | undefined): OwnEnrollment | null {
  if (!raw) return null;
  return {
    groupId: raw.groupId,
    groupName: raw.groupName ?? null,
    sectionLabel: raw.sectionLabel ?? raw.groupName ?? null,
    specialtyName: raw.specialtyName ?? null,
    academicPeriodId: raw.academicPeriodId,
    academicPeriodName: raw.academicPeriodName ?? null,
    startsOn: raw.startsOn,
    status: raw.status,
  };
}

export function normalizeUser(raw: RawUser): AdministrativeUser {
  const firstName =
    raw.firstName?.trim() ||
    raw.name?.trim()?.split(/\s+/)[0] ||
    null;
  const lastName =
    raw.lastName?.trim() ||
    [raw.first_lastname, raw.second_lastname].filter(Boolean).join(' ').trim() ||
    (raw.name?.trim()?.split(/\s+/).slice(1).join(' ') || null);

  return {
    id: raw.id ?? 0,
    name: raw.name ?? ([firstName, lastName].filter(Boolean).join(' ').trim() || null),
    nationalId: raw.nationalId ?? raw.national_id ?? null,
    firstName,
    lastName,
    first_lastname: raw.first_lastname ?? null,
    second_lastname: raw.second_lastname ?? null,
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    status: (raw.status ?? 'ACTIVE') as UserAccountStatus,
    mustChangePassword: Boolean(raw.mustChangePassword),
    roles: raw.roles ?? [],
    departmentId: raw.departmentId ?? raw.department?.id ?? null,
    department: raw.department ?? null,
    enrollment: normalizeEnrollment(raw.enrollment),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export function userToFormValues(user: AdministrativeUser): UserFormValues {
  const departmentId = user.departmentId ?? user.department?.id;
  return {
    nationalId: user.nationalId ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    password: '',
    confirmPassword: '',
    status: user.status,
    roleIds: user.roles.map((role) => role.id),
    departmentId: typeof departmentId === 'number' ? departmentId : '',
    groupId: '',
  };
}

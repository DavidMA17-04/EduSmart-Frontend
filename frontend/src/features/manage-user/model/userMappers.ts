import type { AdministrativeUser, UserAccountStatus } from '@/entities/user';

type RawUser = Partial<AdministrativeUser> & {
  national_id?: string | null;
  first_lastname?: string | null;
  second_lastname?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

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
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    status: (raw.status ?? 'ACTIVE') as UserAccountStatus,
    roles: raw.roles ?? [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export function userToFormValues(user: AdministrativeUser) {
  return {
    nationalId: user.nationalId ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    password: '',
    status: user.status,
    roleIds: user.roles.map((role) => role.id),
  };
}

import type { AdministrativeUser, UserAccountStatus } from '@/entities/user';

export type StatusFilter = 'ALL' | UserAccountStatus;
export type RoleFilter = 'ALL' | number;

export const DIRECTORY_PAGE_SIZE = 10;

export function formatUserName(user: AdministrativeUser) {
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `#${user.id}`;
}

export function filterUsers(
  users: AdministrativeUser[],
  statusFilter: StatusFilter,
  roleFilter: RoleFilter,
  search: string,
): AdministrativeUser[] {
  const term = search.trim().toLowerCase();

  return users.filter((user) => {
    if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;

    if (roleFilter !== 'ALL' && !user.roles.some((role) => role.id === roleFilter)) {
      return false;
    }

    if (!term) return true;

    const haystack = [
      formatUserName(user),
      user.nationalId,
      user.email,
      user.roles.map((role) => role.name).join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
}

export function paginateUsers<T>(items: T[], page: number, pageSize: number = DIRECTORY_PAGE_SIZE): T[] {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPagesFor(count: number, pageSize: number = DIRECTORY_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

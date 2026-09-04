import { useEffect, useMemo, useState } from 'react';
import type { AdministrativeUser, UserAccountStatus } from '@/entities/user';
import type { Role } from '@/entities/role';
import { userApi, type UsersPageResult } from '@/features/manage-user';
import { roleApi } from '@/features/manage-role';
import { HttpError } from '@/shared/api';
import {
  DIRECTORY_PAGE_SIZE,
  filterUsers,
  formatUserName,
  paginateUsers,
  totalPagesFor,
  type RoleFilter,
  type StatusFilter,
} from './usersDirectoryUtils';

export type { StatusFilter, RoleFilter };
export { formatUserName, DIRECTORY_PAGE_SIZE };

export const STATUS_LABELS: Record<UserAccountStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  BLOCKED: 'Bloqueado',
  PENDING: 'Pendiente',
};

function emptyStatusCounts(total = 0): Record<StatusFilter, number> {
  return { ALL: total, ACTIVE: 0, INACTIVE: 0, BLOCKED: 0, PENDING: 0 };
}

export function useUsersDirectory() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  /** Full list only when API returns legacy (non-paginated) payload */
  const [legacyUsers, setLegacyUsers] = useState<AdministrativeUser[] | null>(null);
  const [pageResult, setPageResult] = useState<UsersPageResult | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const query = {
      page,
      limit: DIRECTORY_PAGE_SIZE,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      roleId: roleFilter === 'ALL' ? undefined : roleFilter,
      search: debouncedSearch.trim() || undefined,
    };

    Promise.all([userApi.listPaged(query), roleApi.list()])
      .then(([usersPage, roleItems]) => {
        if (!active) return;
        setRoles(roleItems);
        setError(null);
        if (usersPage.mode === 'legacy') {
          setLegacyUsers(usersPage.items);
          setPageResult(null);
        } else {
          setLegacyUsers(null);
          setPageResult(usersPage);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof HttpError ? err.message : 'No se pudo cargar el directorio de usuarios.');
        setLegacyUsers(null);
        setPageResult(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, statusFilter, roleFilter, debouncedSearch]);

  const changeStatus = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const changeRole = (value: RoleFilter) => {
    setRoleFilter(value);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setRoleFilter('ALL');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters =
    statusFilter !== 'ALL' || roleFilter !== 'ALL' || search.trim().length > 0;

  const legacyFiltered = useMemo(
    () => (legacyUsers ? filterUsers(legacyUsers, statusFilter, roleFilter, search) : []),
    [legacyUsers, statusFilter, roleFilter, search],
  );

  const legacyTotalPages = totalPagesFor(legacyFiltered.length);
  const legacySafePage = Math.min(page, legacyTotalPages);
  const legacyPaginated = useMemo(
    () => (legacyUsers ? paginateUsers(legacyFiltered, legacySafePage) : []),
    [legacyUsers, legacyFiltered, legacySafePage],
  );

  const legacyStatusCounts = useMemo(() => {
    if (!legacyUsers) return emptyStatusCounts();
    const counts = emptyStatusCounts(legacyUsers.length);
    for (const user of legacyUsers) {
      counts[user.status] += 1;
    }
    return counts;
  }, [legacyUsers]);

  const legacyRoleCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const role of roles) {
      counts[role.id] = 0;
    }
    if (!legacyUsers) return counts;
    for (const user of legacyUsers) {
      for (const role of user.roles) {
        counts[role.id] = (counts[role.id] ?? 0) + 1;
      }
    }
    return counts;
  }, [legacyUsers, roles]);

  const isLegacy = legacyUsers !== null;
  const paged = pageResult?.mode === 'paged' ? pageResult : null;
  const totalPages = isLegacy
    ? legacyTotalPages
    : Math.max(1, Math.ceil((paged?.total ?? 0) / DIRECTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return {
    roles,
    isLoading,
    error,
    statusFilter,
    roleFilter,
    search,
    page: safePage,
    totalPages,
    filteredCount: isLegacy ? legacyFiltered.length : (paged?.total ?? 0),
    totalCount: isLegacy ? legacyUsers.length : (paged?.totalCount ?? 0),
    statusCounts: isLegacy ? legacyStatusCounts : (paged?.statusCounts ?? emptyStatusCounts()),
    roleCounts: isLegacy ? legacyRoleCounts : (paged?.roleCounts ?? {}),
    paginatedUsers: isLegacy ? legacyPaginated : (paged?.items ?? []),
    hasActiveFilters,
    changeStatus,
    changeRole,
    changeSearch,
    setPage,
    clearFilters,
  };
}

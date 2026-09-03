import { useEffect, useMemo, useState } from 'react';
import type { AdministrativeUser, UserAccountStatus } from '@/entities/user';
import type { Role } from '@/entities/role';
import { userApi } from '@/features/manage-user';
import { roleApi } from '@/features/manage-role';
import { HttpError } from '@/shared/api';

export type StatusFilter = 'ALL' | UserAccountStatus;
export type RoleFilter = 'ALL' | number;

const PAGE_SIZE = 10;

export function formatUserName(user: AdministrativeUser) {
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `#${user.id}`;
}

export const STATUS_LABELS: Record<UserAccountStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  BLOCKED: 'Bloqueado',
  PENDING: 'Pendiente',
};

export function useUsersDirectory() {
  const [users, setUsers] = useState<AdministrativeUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    Promise.all([userApi.list(), roleApi.list()])
      .then(([userItems, roleItems]) => {
        if (!active) return;
        setUsers(userItems);
        setRoles(roleItems);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof HttpError ? err.message : 'No se pudo cargar el directorio de usuarios.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      ALL: users.length,
      ACTIVE: 0,
      INACTIVE: 0,
      BLOCKED: 0,
      PENDING: 0,
    };
    for (const user of users) {
      counts[user.status] += 1;
    }
    return counts;
  }, [users]);

  const roleCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const role of roles) {
      counts[role.id] = 0;
    }
    for (const user of users) {
      for (const role of user.roles) {
        counts[role.id] = (counts[role.id] ?? 0) + 1;
      }
    }
    return counts;
  }, [users, roles]);

  const filteredUsers = useMemo(() => {
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
  }, [users, statusFilter, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, safePage]);

  return {
    roles,
    isLoading,
    error,
    statusFilter,
    roleFilter,
    search,
    page: safePage,
    totalPages,
    filteredCount: filteredUsers.length,
    totalCount: users.length,
    statusCounts,
    roleCounts,
    paginatedUsers,
    hasActiveFilters,
    changeStatus,
    changeRole,
    changeSearch,
    setPage,
    clearFilters,
  };
}

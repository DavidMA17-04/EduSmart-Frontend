import type { AdministrativeUser, CreateUserPayload, UpdateUserPayload, UserAuditLog, UserAccountStatus } from '@/entities/user';
import { httpClient } from '@/shared/api';
import { normalizeUser } from '../model/userMappers';

type ApiEnvelope<T> = { success: boolean; data: T };

export type UsersListQuery = {
  page?: number;
  limit?: number;
  status?: UserAccountStatus;
  roleId?: number;
  search?: string;
};

export type UsersPageResult =
  | {
      mode: 'paged';
      items: AdministrativeUser[];
      total: number;
      page: number;
      limit: number;
      totalCount: number;
      statusCounts: Record<'ALL' | UserAccountStatus, number>;
      roleCounts: Record<number, number>;
    }
  | {
      mode: 'legacy';
      items: AdministrativeUser[];
    };

type PagedUsersPayload = {
  items: AdministrativeUser[];
  total: number;
  page: number;
  limit: number;
  totalCount: number;
  statusCounts: Record<'ALL' | UserAccountStatus, number>;
  roleCounts: Record<number, number>;
};

async function requestUser<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

function toQueryString(query: UsersListQuery): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);
  if (query.roleId !== undefined) params.set('roleId', String(query.roleId));
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const userApi = {
  list: async () => {
    const items = await requestUser<AdministrativeUser[]>('/users');
    return items.map((item) => normalizeUser(item));
  },
  listPaged: async (query: UsersListQuery): Promise<UsersPageResult> => {
    const data = await requestUser<AdministrativeUser[] | PagedUsersPayload>(
      `/users${toQueryString(query)}`,
    );

    if (Array.isArray(data)) {
      return { mode: 'legacy', items: data.map((item) => normalizeUser(item)) };
    }

    return {
      mode: 'paged',
      items: (data.items ?? []).map((item) => normalizeUser(item)),
      total: data.total ?? 0,
      page: data.page ?? query.page ?? 1,
      limit: data.limit ?? query.limit ?? 10,
      totalCount: data.totalCount ?? data.total ?? 0,
      statusCounts: data.statusCounts ?? {
        ALL: data.totalCount ?? 0,
        ACTIVE: 0,
        INACTIVE: 0,
        BLOCKED: 0,
        PENDING: 0,
      },
      roleCounts: data.roleCounts ?? {},
    };
  },
  getById: async (id: number) => normalizeUser(await requestUser<AdministrativeUser>(`/users/${id}`)),
  create: async (payload: CreateUserPayload) =>
    normalizeUser(await requestUser<AdministrativeUser>('/users', { method: 'POST', body: JSON.stringify(payload) })),
  update: async (id: number, payload: UpdateUserPayload) =>
    normalizeUser(await requestUser<AdministrativeUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })),
  getAuditLogs: (id: number) => requestUser<UserAuditLog[]>(`/users/${id}/audit-logs`),
};

import type { AdministrativeUser, CreateUserPayload, UpdateUserPayload, UserAuditLog } from '@/entities/user';
import { httpClient } from '@/shared/api';
import { normalizeUser } from '../model/userMappers';

type ApiEnvelope<T> = { success: boolean; data: T };

async function requestUser<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const userApi = {
  list: async () => {
    const items = await requestUser<AdministrativeUser[]>('/users');
    return items.map((item) => normalizeUser(item));
  },
  getById: async (id: number) => normalizeUser(await requestUser<AdministrativeUser>(`/users/${id}`)),
  create: async (payload: CreateUserPayload) =>
    normalizeUser(await requestUser<AdministrativeUser>('/users', { method: 'POST', body: JSON.stringify(payload) })),
  update: async (id: number, payload: UpdateUserPayload) =>
    normalizeUser(await requestUser<AdministrativeUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })),
  getAuditLogs: (id: number) => requestUser<UserAuditLog[]>(`/users/${id}/audit-logs`),
};

import type { AdministrativeUser, CreateUserPayload, UpdateUserPayload } from '@/entities/user';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function requestUser<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const userApi = {
  list: () => requestUser<AdministrativeUser[]>('/users'),
  getById: (id: string) => requestUser<AdministrativeUser>(`/users/${id}`),
  create: (payload: CreateUserPayload) =>
    requestUser<AdministrativeUser>('/users', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: UpdateUserPayload) =>
    requestUser<AdministrativeUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

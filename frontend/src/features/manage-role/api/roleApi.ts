import type { CreateRolePayload, Role, UpdateRolePayload } from '@/entities/role';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function requestRole<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const roleApi = {
  list: () => requestRole<Role[]>('/roles'),
  getById: (id: string) => requestRole<Role>(`/roles/${id}`),
  create: (payload: CreateRolePayload) => requestRole<Role>('/roles', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: UpdateRolePayload) => requestRole<Role>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivate: (id: string) => requestRole<Role>(`/roles/${id}`, { method: 'DELETE' }),
};
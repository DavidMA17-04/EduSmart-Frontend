import type { CreateRolePayload, Role, UpdateRolePayload } from '@/entities/role';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function requestRole<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T> | T>(path, init);
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiEnvelope<T>).data;
  }
  return response as T;
}

export const roleApi = {
  list: async (): Promise<Role[]> => {
    const items = await requestRole<Role[]>('/roles');
    return Array.isArray(items) ? items : [];
  },
  getById: (id: number) => requestRole<Role>(`/roles/${id}`),
  create: (payload: CreateRolePayload) => requestRole<Role>('/roles', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: UpdateRolePayload) => requestRole<Role>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivate: (id: number) => requestRole<Role>(`/roles/${id}`, { method: 'DELETE' }),
};
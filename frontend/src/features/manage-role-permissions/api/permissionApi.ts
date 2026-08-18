import type { Permission } from '@/entities/permission';
import type { Role } from '@/entities/role';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const permissionApi = {
  list: () => request<Permission[]>('/permissions'),
  assignToRole: (roleId: string, permissionIds: string[]) => request<Role>(`/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissionIds }),
  }),
};
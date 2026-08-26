import type { Permission, PermissionAction, PermissionModule } from '@/entities/permission';
import type { Role } from '@/entities/role';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

export type CreatePermissionPayload = {
  module: PermissionModule;
  action: PermissionAction;
  code?: string;
  description?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export const permissionApi = {
  list: () => request<Permission[]>('/permissions'),
  create: (payload: CreatePermissionPayload) => request<Permission>('/permissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  assignToRole: (roleId: number, permissionIds: number[]) => request<Role>(`/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissionIds }),
  }),
};
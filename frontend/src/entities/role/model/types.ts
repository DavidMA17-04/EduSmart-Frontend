import type { Permission } from '@/entities/permission';

export type RoleStatus = 'ACTIVE' | 'INACTIVE';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  status: RoleStatus;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  /** Presentación local; el endpoint actual de backend aún no entrega este dato. */
  assignedUsersCount?: number;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  status?: RoleStatus;
  permissionIds?: string[];
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

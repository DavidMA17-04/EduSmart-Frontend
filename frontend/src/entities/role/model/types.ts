import type { Permission } from '@/entities/permission';

export type RoleStatus = 'ACTIVE' | 'INACTIVE';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  status: RoleStatus;
  isSystemRole?: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  assignedUsersCount?: number;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  status?: RoleStatus;
  permissionIds?: number[];
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

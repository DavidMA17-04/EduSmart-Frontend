export type UserAccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

export interface UserRoleRef {
  id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdministrativeUser {
  id: number;
  name: string | null;
  nationalId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: UserAccountStatus;
  roles: UserRoleRef[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  nationalId: string;
  /** Nombres de pila (campo backend: name) */
  name: string;
  /** Primer apellido */
  first_lastname: string;
  /** Segundo apellido (opcional) */
  second_lastname?: string;
  email: string;
  phone?: string;
  password?: string;
  status?: UserAccountStatus;
  roleIds?: number[];
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface UserAuditLog {
  id: number;
  actorId: number | null;
  action: string;
  entity: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

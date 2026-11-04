export type UserAccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

export interface UserRoleRef {
  id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UserDepartmentRef {
  id: number;
  code: string;
  name: string;
}

export interface OwnEnrollment {
  groupId: number;
  groupName: string | null;
  sectionLabel: string | null;
  specialtyName: string | null;
  academicPeriodId: number;
  academicPeriodName: string | null;
  startsOn: string;
  status: string;
}

export interface AdministrativeUser {
  id: number;
  name: string | null;
  nationalId: string | null;
  firstName: string | null;
  lastName: string | null;
  first_lastname?: string | null;
  second_lastname?: string | null;
  email: string | null;
  phone: string | null;
  status: UserAccountStatus;
  mustChangePassword?: boolean;
  roles: UserRoleRef[];
  departmentId?: number | null;
  department?: UserDepartmentRef | null;
  enrollment?: OwnEnrollment | null;
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
  /** Obligatorio si el usuario tiene rol Docente. */
  departmentId?: number;
  /** Obligatorio si el usuario tiene rol Estudiante y estado ACTIVE. */
  groupId?: number;
}

export type UpdateUserPayload = Partial<CreateUserPayload> & {
  /** Motivo de baja; obligatorio al pasar a INACTIVE. */
  reason?: string;
};

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

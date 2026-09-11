export const PERMISSION_ACTIONS = [
  'VIEW',
  'CREATE',
  'EDIT',
  'DELETE',
  'EXPORT',
  'CONFIGURE',
  'VIEW_OWN',
] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_MODULES = [
  'ADMINISTRATOR',
  'ACADEMIC_STRUCTURE',
  'PERIODS',
  'ATTENDANCE',
  'STUDENTS',
  'DISCIPLINARY',
  'COMMUNICATIONS',
  'APPEALS',
  'ROLES_PERMISSIONS',
  'SPECIALTIES',
  'SECTIONS',
  'SCHEDULES',
] as const;
export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  VIEW: 'Ver',
  CREATE: 'Crear',
  EDIT: 'Editar',
  DELETE: 'Eliminar',
  EXPORT: 'Exportar',
  CONFIGURE: 'Configurar',
  VIEW_OWN: 'Ver propio',
};

export const PERMISSION_MODULE_LABELS: Record<PermissionModule, string> = {
  ADMINISTRATOR: 'Administrativo',
  ACADEMIC_STRUCTURE: 'Estructura académica',
  PERIODS: 'Períodos',
  ATTENDANCE: 'Asistencias',
  STUDENTS: 'Estudiantes',
  DISCIPLINARY: 'Amonestaciones',
  COMMUNICATIONS: 'Avisos',
  APPEALS: 'Apelaciones',
  ROLES_PERMISSIONS: 'Roles y permisos',
  SPECIALTIES: 'Especialidades',
  SECTIONS: 'Secciones',
  SCHEDULES: 'Horarios',
};

export interface Permission {
  id: number;
  code: string;
  module: PermissionModule;
  action: PermissionAction;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

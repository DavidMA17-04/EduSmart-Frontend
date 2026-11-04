/**
 * Códigos de permisos críticos del Administrador (espejo backend PO-02-05).
 * Deben permanecer marcados y no editables en la matriz.
 */
export const PROTECTED_ADMIN_PERMISSIONS = [
  'roles_permissions.view',
  'roles_permissions.create',
  'roles_permissions.edit',
  'roles_permissions.delete',
  'administrator.view',
  'administrator.create',
  'administrator.edit',
  'administrator.delete',
  'administrator.configure',
] as const;

export const PROTECTED_ADMIN_PERMISSION_SET = new Set<string>(PROTECTED_ADMIN_PERMISSIONS);

export const PROTECTED_ADMIN_PERMISSION_TOOLTIP =
  'Permiso protegido del sistema: no se puede desactivar en el rol Administrador.';

export function isProtectedAdminPermission(code: string): boolean {
  return PROTECTED_ADMIN_PERMISSION_SET.has(code);
}

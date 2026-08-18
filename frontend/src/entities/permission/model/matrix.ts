import { PERMISSION_ACTIONS, PERMISSION_MODULES, type Permission, type PermissionAction, type PermissionModule } from './types';

export type PermissionMatrix = Record<PermissionModule, Partial<Record<PermissionAction, Permission>>>;

export function buildPermissionMatrix(permissions: Permission[]): PermissionMatrix {
  const matrix = Object.fromEntries(PERMISSION_MODULES.map((module) => [module, {}])) as PermissionMatrix;
  permissions.forEach((permission) => { matrix[permission.module][permission.action] = permission; });
  return matrix;
}

export function getPermissionIds(permissions: Permission[]): string[] {
  return permissions.map((permission) => permission.id);
}

export { PERMISSION_ACTIONS };
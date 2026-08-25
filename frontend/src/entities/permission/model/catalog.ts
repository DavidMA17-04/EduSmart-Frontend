import { PERMISSION_ACTIONS, PERMISSION_MODULES, type PermissionAction, type PermissionModule } from './types';

export function buildPermissionCode(module: PermissionModule, action: PermissionAction): string {
  return `${module.toLowerCase()}.${action.toLowerCase()}`;
}

export function listExpectedPermissionPairs(): Array<{ module: PermissionModule; action: PermissionAction }> {
  return PERMISSION_MODULES.flatMap((module) => PERMISSION_ACTIONS.map((action) => ({ module, action })));
}

export function permissionKey(module: PermissionModule, action: PermissionAction): string {
  return `${module}:${action}`;
}

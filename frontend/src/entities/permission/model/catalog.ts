import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type PermissionAction,
  type PermissionModule,
} from './types';

/** Classic catalog actions auto-synced by admin UI (excludes scoped VIEW_OWN). */
export const CATALOG_SYNC_ACTIONS = PERMISSION_ACTIONS.filter(
  (action): action is Exclude<PermissionAction, 'VIEW_OWN'> => action !== 'VIEW_OWN',
);

/**
 * Modules auto-synced by admin UI.
 * SCHEDULES permissions are migration-managed — do not invent rows from FE.
 */
export const CATALOG_SYNC_MODULES = PERMISSION_MODULES.filter(
  (module): module is Exclude<PermissionModule, 'SCHEDULES'> => module !== 'SCHEDULES',
);

export function buildPermissionCode(module: PermissionModule, action: PermissionAction): string {
  return `${module.toLowerCase()}.${action.toLowerCase()}`;
}

export function listExpectedPermissionPairs(): Array<{ module: PermissionModule; action: PermissionAction }> {
  return CATALOG_SYNC_MODULES.flatMap((module) =>
    CATALOG_SYNC_ACTIONS.map((action) => ({ module, action })),
  );
}

export function permissionKey(module: PermissionModule, action: PermissionAction): string {
  return `${module}:${action}`;
}

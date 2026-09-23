export { PermissionCheckbox } from './ui/PermissionCheckbox';
export { PermissionToggle } from './ui/PermissionToggle';
export { buildPermissionCode, listExpectedPermissionPairs, permissionKey } from './model/catalog';
export { buildPermissionMatrix, getPermissionIds } from './model/matrix';
export type { PermissionMatrix } from './model/matrix';
export {
  isProtectedAdminPermission,
  PROTECTED_ADMIN_PERMISSIONS,
  PROTECTED_ADMIN_PERMISSION_SET,
  PROTECTED_ADMIN_PERMISSION_TOOLTIP,
} from './model/protectedAdminPermissions';
export { PERMISSION_ACTIONS, PERMISSION_ACTION_LABELS, PERMISSION_MODULES, PERMISSION_MODULE_LABELS } from './model/types';
export type { Permission, PermissionAction, PermissionModule } from './model/types';

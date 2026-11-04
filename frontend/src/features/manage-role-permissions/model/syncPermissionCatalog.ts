import {
  buildPermissionCode,
  listExpectedPermissionPairs,
  permissionKey,
  type Permission,
} from '@/entities/permission';
import { permissionApi } from '../api/permissionApi';

export async function syncPermissionCatalog(existing: Permission[]): Promise<Permission[]> {
  const catalog = new Map(existing.map((permission) => [permissionKey(permission.module, permission.action), permission]));
  const missing = listExpectedPermissionPairs().filter(({ module, action }) => !catalog.has(permissionKey(module, action)));

  if (missing.length === 0) return existing;

  const created = await Promise.all(missing.map(({ module, action }) => permissionApi.create({
    module,
    action,
    code: buildPermissionCode(module, action),
  })));

  return [...existing, ...created].sort((left, right) => {
    const moduleCompare = left.module.localeCompare(right.module);
    return moduleCompare !== 0 ? moduleCompare : left.action.localeCompare(right.action);
  });
}

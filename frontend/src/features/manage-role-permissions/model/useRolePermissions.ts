import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isProtectedAdminPermission,
  type Permission,
} from '@/entities/permission';
import { ADMIN_ROLE_NAME, type Role } from '@/entities/role';
import { permissionApi } from '../api/permissionApi';

function getPermissionIds(role?: Role): number[] {
  return role?.permissions.map((permission) => permission.id) ?? [];
}

export function useRolePermissions(
  role?: Role,
  onSaved?: (updatedRole: Role) => void,
  catalog: Permission[] = [],
) {
  const [savedPermissionIds, setSavedPermissionIds] = useState<number[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isAdminRole = role?.name === ADMIN_ROLE_NAME;

  const protectedPermissionIds = useMemo(() => {
    if (!isAdminRole) return new Set<number>();
    return new Set(
      catalog
        .filter((permission) => isProtectedAdminPermission(permission.code))
        .map((permission) => permission.id),
    );
  }, [catalog, isAdminRole]);

  useEffect(() => {
    const nextIds = getPermissionIds(role);
    setSavedPermissionIds(nextIds);
    setSelectedPermissionIds(nextIds);
    setIsEditing(false);
    setError(null);
    setSaveMessage(null);
  }, [role]);

  const hasChanges = useMemo(() => {
    if (savedPermissionIds.length !== selectedPermissionIds.length) return true;
    const saved = new Set(savedPermissionIds);
    return selectedPermissionIds.some((id) => !saved.has(id));
  }, [savedPermissionIds, selectedPermissionIds]);

  const grantedCount = savedPermissionIds.length;

  const togglePermission = useCallback((permissionId: number, checked: boolean) => {
    if (protectedPermissionIds.has(permissionId) && !checked) {
      return;
    }
    setSelectedPermissionIds((current) => checked
      ? [...new Set([...current, permissionId])]
      : current.filter((id) => id !== permissionId));
    setSaveMessage(null);
  }, [protectedPermissionIds]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setError(null);
    setSaveMessage(null);
  }, []);

  const cancelEditing = useCallback(() => {
    setSelectedPermissionIds(savedPermissionIds);
    setIsEditing(false);
    setError(null);
    setSaveMessage(null);
  }, [savedPermissionIds]);

  const applyUpdatedRole = useCallback((updatedRole: Role, message: string) => {
    const nextIds = getPermissionIds(updatedRole);
    setSavedPermissionIds(nextIds);
    setSelectedPermissionIds(nextIds);
    setIsEditing(false);
    setSaveMessage(message);
    onSaved?.(updatedRole);
  }, [onSaved]);

  const save = useCallback(async () => {
    if (!role) return;
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const idsToSave = isAdminRole
        ? [...new Set([...selectedPermissionIds, ...protectedPermissionIds])]
        : selectedPermissionIds;
      const updatedRole = await permissionApi.assignToRole(role.id, idsToSave);
      applyUpdatedRole(updatedRole, 'Permisos guardados correctamente.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron guardar los permisos.');
      throw reason;
    } finally {
      setIsSaving(false);
    }
  }, [applyUpdatedRole, isAdminRole, protectedPermissionIds, role, selectedPermissionIds]);

  const resetToDefaults = useCallback(async () => {
    if (!role) return;
    setIsResetting(true);
    setError(null);
    setSaveMessage(null);
    try {
      const updatedRole = await permissionApi.resetToDefaults(role.id);
      applyUpdatedRole(updatedRole, 'Permisos restablecidos a los valores predeterminados.');
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No se pudieron restablecer los permisos predeterminados.',
      );
      throw reason;
    } finally {
      setIsResetting(false);
    }
  }, [applyUpdatedRole, role]);

  return {
    savedPermissionIds,
    selectedPermissionIds,
    grantedCount,
    isEditing,
    hasChanges,
    lockProtectedAdminPermissions: isAdminRole,
    togglePermission,
    startEditing,
    cancelEditing,
    resetToDefaults,
    save,
    isSaving,
    isResetting,
    error,
    saveMessage,
  };
}

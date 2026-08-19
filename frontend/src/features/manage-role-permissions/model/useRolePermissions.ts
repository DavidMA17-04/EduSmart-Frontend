import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Role } from '@/entities/role';
import { permissionApi } from '../api/permissionApi';

function getPermissionIds(role?: Role): string[] {
  return role?.permissions.map((permission) => permission.id) ?? [];
}

export function useRolePermissions(role?: Role, onSaved?: (updatedRole: Role) => void) {
  const [savedPermissionIds, setSavedPermissionIds] = useState<string[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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

  const togglePermission = useCallback((permissionId: string, checked: boolean) => {
    setSelectedPermissionIds((current) => checked
      ? [...new Set([...current, permissionId])]
      : current.filter((id) => id !== permissionId));
    setSaveMessage(null);
  }, []);

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

  const clearAll = useCallback(() => {
    setSelectedPermissionIds([]);
    setSaveMessage(null);
  }, []);

  const save = useCallback(async () => {
    if (!role) return;
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const updatedRole = await permissionApi.assignToRole(role.id, selectedPermissionIds);
      const nextIds = getPermissionIds(updatedRole);
      setSavedPermissionIds(nextIds);
      setSelectedPermissionIds(nextIds);
      setIsEditing(false);
      setSaveMessage('Permisos guardados correctamente.');
      onSaved?.(updatedRole);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron guardar los permisos.');
      throw reason;
    } finally {
      setIsSaving(false);
    }
  }, [onSaved, role, selectedPermissionIds]);

  return {
    savedPermissionIds,
    selectedPermissionIds,
    grantedCount,
    isEditing,
    hasChanges,
    togglePermission,
    startEditing,
    cancelEditing,
    clearAll,
    save,
    isSaving,
    error,
    saveMessage,
  };
}

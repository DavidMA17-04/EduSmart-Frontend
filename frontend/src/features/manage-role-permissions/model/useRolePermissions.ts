import { useCallback, useEffect, useState } from 'react';
import type { Role } from '@/entities/role';
import { permissionApi } from '../api/permissionApi';

export function useRolePermissions(role?: Role, onSaved?: () => void) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedPermissionIds(role?.permissions.map((permission) => permission.id) ?? []);
    setError(null);
  }, [role]);

  const togglePermission = useCallback((permissionId: string, checked: boolean) => {
    setSelectedPermissionIds((current) => checked
      ? [...new Set([...current, permissionId])]
      : current.filter((id) => id !== permissionId));
  }, []);

  const save = useCallback(async () => {
    if (!role) return;
    setIsSaving(true);
    setError(null);
    try {
      await permissionApi.assignToRole(role.id, selectedPermissionIds);
      onSaved?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron guardar los permisos.');
      throw reason;
    } finally {
      setIsSaving(false);
    }
  }, [onSaved, role, selectedPermissionIds]);

  return { selectedPermissionIds, togglePermission, save, isSaving, error };
}
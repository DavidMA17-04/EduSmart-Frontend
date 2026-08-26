import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Role } from '@/entities/role';
import { roleApi, useManageRole, useRoleForm } from '@/features/manage-role';
import { usePermissions, useRolePermissions } from '@/features/manage-role-permissions';

type DialogMode = 'create' | 'edit' | 'duplicate' | null;

export function useRolesPermissionsPanel() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const refreshRoles = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingRoles(true);
    setRolesError(null);
    try {
      const nextRoles = await roleApi.list();
      setRoles(nextRoles);
      setSelectedRoleId((current) => {
        const activeRoles = nextRoles.filter((role) => role.status === 'ACTIVE');
        if (current && activeRoles.some((role) => role.id === current)) return current;
        return activeRoles[0]?.id ?? null;
      });
    } catch (reason) {
      setRolesError(reason instanceof Error ? reason.message : 'No se pudieron cargar los roles.');
    } finally {
      if (!silent) setIsLoadingRoles(false);
    }
  }, []);

  useEffect(() => { void refreshRoles(); }, [refreshRoles]);

  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId), [roles, selectedRoleId]);
  const formRole = useMemo(() => dialogMode === 'duplicate' && selectedRole
    ? { ...selectedRole, name: `${selectedRole.name} (copia)` }
    : selectedRole, [dialogMode, selectedRole]);
  const { values, setField, toPayload } = useRoleForm(dialogMode === 'create' ? undefined : formRole);
  const { create, update, deactivate, duplicate, error: mutationError, isSubmitting } = useManageRole(() => refreshRoles(true));
  const { permissions, isLoading: isLoadingPermissions, error: permissionsError, reload: reloadPermissions } = usePermissions();
  const rolePermissions = useRolePermissions(selectedRole, (updatedRole) => {
    setRoles((current) => current.map((item) => item.id === updatedRole.id ? updatedRole : item));
  });

  const filteredRoles = useMemo(() => {
    const activeRoles = roles.filter((role) => role.status === 'ACTIVE');
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return normalizedSearch
      ? activeRoles.filter((role) => role.name.toLocaleLowerCase().includes(normalizedSearch))
      : activeRoles;
  }, [roles, search]);

  const submitRole = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload();
    if (!payload.name) return;
    try {
      if (dialogMode === 'create') await create(payload);
      if (dialogMode === 'edit' && selectedRole) await update(selectedRole.id, payload);
      if (dialogMode === 'duplicate' && selectedRole) await duplicate(selectedRole, payload);
      setDialogMode(null);
    } catch {
      // El hook de mutaciones publica el mensaje para la interfaz.
    }
  }, [create, dialogMode, duplicate, selectedRole, toPayload, update]);

  const deactivateSelectedRole = useCallback(async () => {
    if (!selectedRole || !window.confirm(`¿Inactivar el rol ${selectedRole.name}?`)) return;
    const deactivatedRoleId = selectedRole.id;
    try {
      await deactivate(deactivatedRoleId);
      setRoles((current) => {
        const next = current.map((role) => (
          role.id === deactivatedRoleId ? { ...role, status: 'INACTIVE' as const } : role
        ));
        setSelectedRoleId((selectedId) => {
          if (selectedId !== deactivatedRoleId) return selectedId;
          return next.find((role) => role.status === 'ACTIVE')?.id ?? null;
        });
        return next;
      });
    } catch {
      // El error se expone desde el hook.
    }
  }, [deactivate, selectedRole]);

  return {
    roles: filteredRoles,
    selectedRole,
    selectedRoleId,
    selectRole: setSelectedRoleId,
    search,
    setSearch,
    dialogMode,
    openDialog: setDialogMode,
    closeDialog: () => setDialogMode(null),
    roleForm: { values, setField, submit: submitRole },
    mutationError,
    isSubmitting,
    deactivateSelectedRole,
    permissions,
    isLoadingPermissions,
    permissionsError,
    reloadPermissions,
    ...rolePermissions,
    isLoadingRoles,
    rolesError,
    reloadRoles: refreshRoles,
  };
}
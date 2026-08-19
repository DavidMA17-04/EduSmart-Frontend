import { useCallback, useState } from 'react';
import type { CreateRolePayload, Role, UpdateRolePayload } from '@/entities/role';
import { roleApi } from '../api/roleApi';

type RoleMutation = <T>(operation: () => Promise<T>) => Promise<T>;

export function useManageRole(onSuccess?: () => void | Promise<void>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback<RoleMutation>(async (operation) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await operation();
      await onSuccess?.();
      return result;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'No se pudo completar la operación.';
      setError(message);
      throw reason;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess]);

  const create = useCallback((payload: CreateRolePayload) => execute(() => roleApi.create(payload)), [execute]);
  const update = useCallback((id: string, payload: UpdateRolePayload) => execute(() => roleApi.update(id, payload)), [execute]);
  const deactivate = useCallback((id: string) => execute(() => roleApi.deactivate(id)), [execute]);
  const duplicate = useCallback((role: Role, payload: CreateRolePayload) => execute(() => roleApi.create({
    ...payload,
    permissionIds: role.permissions.map((permission) => permission.id),
  })), [execute]);

  return { create, update, deactivate, duplicate, error, isSubmitting, clearError: () => setError(null) };
}
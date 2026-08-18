import { useCallback, useEffect, useState } from 'react';
import type { CreateRolePayload, Role, RoleStatus } from '@/entities/role';

export interface RoleFormValues {
  name: string;
  description: string;
  status: RoleStatus;
}

const defaultValues: RoleFormValues = { name: '', description: '', status: 'ACTIVE' };

export function useRoleForm(role?: Role) {
  const [values, setValues] = useState<RoleFormValues>(defaultValues);

  useEffect(() => {
    setValues(role ? { name: role.name, description: role.description ?? '', status: role.status } : defaultValues);
  }, [role]);

  const setField = useCallback(<K extends keyof RoleFormValues>(field: K, value: RoleFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const toPayload = useCallback((): CreateRolePayload => ({
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    status: values.status,
  }), [values]);

  return { values, setField, toPayload };
}
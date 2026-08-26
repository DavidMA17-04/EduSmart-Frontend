import { useCallback, useEffect, useState } from 'react';
import type { CreateSpecialtyPayload, Specialty, SpecialtyStatus } from '@/entities/specialty';

export interface SpecialtyFormValues {
  name: string;
  description: string;
  status: SpecialtyStatus;
}

const defaultValues: SpecialtyFormValues = { name: '', description: '', status: 'ACTIVE' };

export function useSpecialtyForm(specialty?: Specialty) {
  const [values, setValues] = useState<SpecialtyFormValues>(defaultValues);

  useEffect(() => {
    setValues(specialty ? { name: specialty.name, description: specialty.description ?? '', status: specialty.status } : defaultValues);
  }, [specialty]);

  const setField = useCallback(<K extends keyof SpecialtyFormValues>(field: K, value: SpecialtyFormValues[K]) => setValues((current) => ({ ...current, [field]: value })), []);
  const toPayload = useCallback((): CreateSpecialtyPayload => ({
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    status: values.status,
  }), [values]);

  return { values, setField, toPayload };
}

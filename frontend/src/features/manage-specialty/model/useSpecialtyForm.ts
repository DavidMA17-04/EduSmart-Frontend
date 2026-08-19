import { useCallback, useEffect, useState } from 'react';
import type { CreateSpecialtyPayload, Specialty, SpecialtyStatus } from '@/entities/specialty';

export interface SpecialtyFormValues {
  code: string;
  name: string;
  area: string;
  description: string;
  duration: number;
  status: SpecialtyStatus;
}

const defaultValues: SpecialtyFormValues = { code: '', name: '', area: '', description: '', duration: 1, status: 'ACTIVE' };

export function useSpecialtyForm(specialty?: Specialty) {
  const [values, setValues] = useState<SpecialtyFormValues>(defaultValues);

  useEffect(() => {
    setValues(specialty ? { code: specialty.code, name: specialty.name, area: specialty.area, description: specialty.description ?? '', duration: specialty.duration, status: specialty.status } : defaultValues);
  }, [specialty]);

  const setField = useCallback(<K extends keyof SpecialtyFormValues>(field: K, value: SpecialtyFormValues[K]) => setValues((current) => ({ ...current, [field]: value })), []);
  const toPayload = useCallback((): CreateSpecialtyPayload => ({ code: values.code.trim().toUpperCase(), name: values.name.trim(), area: values.area.trim(), description: values.description.trim() || undefined, duration: values.duration, status: values.status }), [values]);

  return { values, setField, toPayload };
}
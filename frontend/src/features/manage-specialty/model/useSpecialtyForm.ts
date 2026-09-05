import { useCallback, useEffect, useRef, useState } from 'react';
import type { CreateSpecialtyPayload, Specialty, SpecialtyKind, SpecialtyStatus } from '@/entities/specialty';

export interface SpecialtyFormValues {
  name: string;
  description: string;
  status: SpecialtyStatus;
}

const defaultValues: SpecialtyFormValues = { name: '', description: '', status: 'ACTIVE' };

export function useSpecialtyForm(specialty: Specialty | undefined, kind: SpecialtyKind, resetToken = 0) {
  const [values, setValues] = useState<SpecialtyFormValues>(defaultValues);
  const nameInputRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    setValues(
      specialty
        ? { name: specialty.name, description: specialty.description ?? '', status: specialty.status }
        : defaultValues,
    );
  }, [specialty, resetToken]);

  const setField = useCallback(
    <K extends keyof SpecialtyFormValues>(field: K, value: SpecialtyFormValues[K]) =>
      setValues((current) => ({ ...current, [field]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(defaultValues);
  }, []);

  const toPayload = useCallback(
    (): CreateSpecialtyPayload => ({
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      status: values.status,
      kind,
    }),
    [kind, values],
  );

  return { values, setField, toPayload, reset, nameInputRef };
}

import { useCallback, useEffect, useState } from 'react';
import type { CreateSectionPayload, Section, SectionStatus } from '@/entities/section';

export interface SectionFormValues { code: string; name: string; description: string; status: SectionStatus; }
const defaultValues: SectionFormValues = { code: '', name: '', description: '', status: 'ACTIVE' };

export function useSectionForm(section?: Section) {
  const [values, setValues] = useState<SectionFormValues>(defaultValues);
  useEffect(() => { setValues(section ? { code: section.code, name: section.name, description: section.description ?? '', status: section.status } : defaultValues); }, [section]);
  const setField = useCallback(<K extends keyof SectionFormValues>(field: K, value: SectionFormValues[K]) => setValues((current) => ({ ...current, [field]: value })), []);
  const toPayload = useCallback((): CreateSectionPayload => ({ code: values.code.trim().toUpperCase(), name: values.name.trim(), description: values.description.trim() || undefined, status: values.status }), [values]);
  return { values, setField, toPayload };
}
import { useCallback, useEffect, useState } from 'react';
import type { CreateSectionPayload, Section, SectionStatus } from '@/entities/section';

export interface SectionFormValues {
  name: string;
  gradeLevel: number;
  academicPeriodId: string;
  specialtyId: string;
  description: string;
  status: SectionStatus;
}

const defaultValues: SectionFormValues = {
  name: '',
  gradeLevel: 7,
  academicPeriodId: '',
  specialtyId: '',
  description: '',
  status: 'ACTIVE',
};

export function useSectionForm(section?: Section) {
  const [values, setValues] = useState<SectionFormValues>(defaultValues);
  useEffect(() => {
    setValues(section
      ? {
          name: section.name,
          gradeLevel: section.gradeLevel,
          academicPeriodId: String(section.academicPeriodId ?? ''),
          specialtyId: section.specialtyId == null ? '' : String(section.specialtyId),
          description: section.description ?? '',
          status: section.status,
        }
      : defaultValues);
  }, [section]);
  const setField = useCallback(<K extends keyof SectionFormValues>(field: K, value: SectionFormValues[K]) => setValues((current) => ({ ...current, [field]: value })), []);
  const toPayload = useCallback((): CreateSectionPayload => ({
    name: values.name.trim(),
    gradeLevel: Number(values.gradeLevel),
    academicPeriodId: Number(values.academicPeriodId),
    specialtyId: values.specialtyId ? Number(values.specialtyId) : null,
    description: values.description.trim() || undefined,
    status: values.status,
  }), [values]);
  return { values, setField, toPayload };
}

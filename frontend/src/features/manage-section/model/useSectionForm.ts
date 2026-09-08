import { useCallback, useEffect, useState } from 'react';
import type { CreateSectionPayload, Section, SectionStatus } from '@/entities/section';
import { type EmptyableNumber, toOptionalCount } from '@/shared/lib/number-input';

export interface SectionFormValues {
  name: string;
  gradeLevel: EmptyableNumber;
  academicPeriodId: string;
  description: string;
  status: SectionStatus;
}

const defaultValues: SectionFormValues = {
  name: '',
  gradeLevel: '',
  academicPeriodId: '',
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
          description: section.description ?? '',
          status: section.status,
        }
      : defaultValues);
  }, [section]);
  const setField = useCallback(<K extends keyof SectionFormValues>(field: K, value: SectionFormValues[K]) => setValues((current) => ({ ...current, [field]: value })), []);
  const toPayload = useCallback((): CreateSectionPayload => ({
    name: values.name.trim(),
    gradeLevel: toOptionalCount(values.gradeLevel, Number.NaN),
    academicPeriodId: Number(values.academicPeriodId),
    description: values.description.trim() || undefined,
    status: values.status,
  }), [values]);
  return { values, setField, toPayload };
}

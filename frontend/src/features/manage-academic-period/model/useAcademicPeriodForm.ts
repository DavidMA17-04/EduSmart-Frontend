import { useCallback, useEffect, useState } from 'react';
import type { AcademicPeriod, CreateAcademicPeriodPayload } from '@/entities/academic-period';
import { toDateInputValue } from '@/entities/academic-period';

export interface AcademicPeriodFormValues {
  name: string;
  startDate: string;
  endDate: string;
}

const defaultValues: AcademicPeriodFormValues = {
  name: '',
  startDate: '',
  endDate: '',
};

export function useAcademicPeriodForm(period?: AcademicPeriod) {
  const [values, setValues] = useState<AcademicPeriodFormValues>(defaultValues);

  useEffect(() => {
    setValues(period
      ? {
          name: period.name,
          startDate: toDateInputValue(period.startDate),
          endDate: toDateInputValue(period.endDate),
        }
      : defaultValues);
  }, [period]);

  const setField = useCallback(<K extends keyof AcademicPeriodFormValues>(field: K, value: AcademicPeriodFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const toPayload = useCallback((): CreateAcademicPeriodPayload => ({
    name: values.name.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
  }), [values]);

  return { values, setField, toPayload };
}

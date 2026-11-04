import { useCallback, useState } from 'react';
import type { CreateAcademicPeriodPayload, UpdateAcademicPeriodPayload } from '@/entities/academic-period';
import { academicPeriodApi } from '../api/academicPeriodApi';

type Mutation = <T>(operation: () => Promise<T>) => Promise<T>;

export function useManageAcademicPeriod(onSuccess?: () => void | Promise<void>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback<Mutation>(async (operation) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await operation();
      await onSuccess?.();
      return result;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo completar la operación.');
      throw reason;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess]);

  return {
    create: (payload: CreateAcademicPeriodPayload) => execute(() => academicPeriodApi.create(payload)),
    update: (id: string, payload: UpdateAcademicPeriodPayload) => execute(() => academicPeriodApi.update(id, payload)),
    activate: (id: string) => execute(() => academicPeriodApi.activate(id)),
    close: (id: string) => execute(() => academicPeriodApi.close(id)),
    reopen: (id: string) => execute(() => academicPeriodApi.reopen(id)),
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}

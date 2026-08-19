import { useCallback, useState } from 'react';
import type { CreateSpecialtyPayload, UpdateSpecialtyPayload } from '@/entities/specialty';
import { specialtyApi } from '../api/specialtyApi';

type Mutation = <T>(operation: () => Promise<T>) => Promise<T>;

export function useManageSpecialty(onSuccess?: () => void) {
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
    create: (payload: CreateSpecialtyPayload) => execute(() => specialtyApi.create(payload)),
    update: (id: string, payload: UpdateSpecialtyPayload) => execute(() => specialtyApi.update(id, payload)),
    deactivate: (id: string) => execute(() => specialtyApi.deactivate(id)),
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}
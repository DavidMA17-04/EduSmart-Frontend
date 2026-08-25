import { useCallback, useState } from 'react';
import type { CreateSectionPayload, UpdateSectionPayload } from '@/entities/section';
import { sectionApi } from '../api/sectionApi';

type Mutation = <T>(operation: () => Promise<T>) => Promise<T>;

export function useManageSection(onSuccess?: () => void | Promise<void>) {
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
    create: (payload: CreateSectionPayload) => execute(() => sectionApi.create(payload)),
    update: (id: string, payload: UpdateSectionPayload) => execute(() => sectionApi.update(id, payload)),
    deactivate: (id: string) => execute(() => sectionApi.deactivate(id)),
    isSubmitting,
    error,
  };
}

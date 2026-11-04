import { useCallback, useState } from 'react';
import type { CreateGuideTeacherPayload, UpdateGuideTeacherPayload } from '@/entities/group';
import { guideTeacherApi } from '../api/guideTeacherApi';

type Mutation = <T>(operation: () => Promise<T>) => Promise<T>;

export function useManageGuideTeacher(onSuccess?: () => void | Promise<void>) {
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
    create: (payload: CreateGuideTeacherPayload) => execute(() => guideTeacherApi.create(payload)),
    update: (id: number, payload: UpdateGuideTeacherPayload) => execute(() => guideTeacherApi.update(id, payload)),
    remove: (id: number) => execute(() => guideTeacherApi.remove(id)),
    isSubmitting,
    error,
  };
}

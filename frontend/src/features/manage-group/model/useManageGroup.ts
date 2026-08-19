import { useCallback, useState } from 'react';
import type { AssignGuideTeacherPayload, CreateGroupPayload, UpdateGroupPayload } from '@/entities/group';
import { groupApi } from '../api/groupApi';

type Mutation = <T>(operation: () => Promise<T>) => Promise<T>;

export function useManageGroup(onSuccess?: () => void | Promise<void>) {
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
    create: (payload: CreateGroupPayload) => execute(() => groupApi.create(payload)),
    update: (id: string, payload: UpdateGroupPayload) => execute(() => groupApi.update(id, payload)),
    assignGuideTeacher: (id: string, payload: AssignGuideTeacherPayload) =>
      execute(() => groupApi.assignGuideTeacher(id, payload)),
    remove: (id: string) => execute(() => groupApi.remove(id)),
    isSubmitting,
    error,
  };
}

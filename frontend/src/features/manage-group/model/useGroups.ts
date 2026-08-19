import { useCallback, useEffect, useState } from 'react';
import type { AcademicGroup } from '@/entities/group';
import { groupApi } from '../api/groupApi';

export function useGroups() {
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      setGroups(await groupApi.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las secciones.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upsertGroup = useCallback((updated: AcademicGroup) => {
    setGroups((current) => {
      const index = current.findIndex((group) => group.id === updated.id);
      if (index === -1) return [...current, updated];
      const next = [...current];
      next[index] = { ...current[index], ...updated };
      return next;
    });
  }, []);

  const removeGroup = useCallback((id: string) => {
    setGroups((current) => current.filter((group) => group.id !== id));
  }, []);

  return { groups, isLoading, error, reload: load, upsertGroup, removeGroup };
}

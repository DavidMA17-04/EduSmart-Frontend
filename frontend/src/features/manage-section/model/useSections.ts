import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Section } from '@/entities/section';
import { sectionApi } from '../api/sectionApi';

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      setSections(await sectionApi.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los niveles.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const removeSection = useCallback((id: string) => {
    setSections((current) => current.filter((section) => section.id !== id));
  }, []);

  const upsertSection = useCallback((section: Section) => {
    setSections((current) => {
      const index = current.findIndex((item) => item.id === section.id);
      if (index === -1) return [...current, section];
      const next = [...current];
      next[index] = section;
      return next;
    });
  }, []);

  const activeSections = useMemo(
    () => sections.filter((section) => section.status === 'ACTIVE'),
    [sections],
  );

  return {
    sections: activeSections,
    allSections: sections,
    isLoading,
    error,
    reload: load,
    removeSection,
    upsertSection,
  };
}

import { useCallback, useEffect, useState } from 'react';
import type { Section } from '@/entities/section';
import { sectionApi } from '../api/sectionApi';

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setIsLoading(true); setError(null); try { setSections(await sectionApi.list()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los niveles.'); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  return { sections, isLoading, error, reload: load };
}
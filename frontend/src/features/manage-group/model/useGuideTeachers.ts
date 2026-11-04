import { useCallback, useEffect, useState } from 'react';
import type { GuideTeacher } from '@/entities/group';
import { guideTeacherApi } from '../api/guideTeacherApi';

export function useGuideTeachers() {
  const [guideTeachers, setGuideTeachers] = useState<GuideTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setGuideTeachers(await guideTeacherApi.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los docentes guía.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upsert = useCallback((teacher: GuideTeacher) => {
    setGuideTeachers((current) => {
      const index = current.findIndex((item) => item.id === teacher.id);
      const next = index === -1 ? [...current, teacher] : current.map((item) => (item.id === teacher.id ? teacher : item));
      return next.sort((a, b) => a.lastName.localeCompare(b.lastName, 'es') || a.firstName.localeCompare(b.firstName, 'es'));
    });
  }, []);

  const remove = useCallback((id: number) => {
    setGuideTeachers((current) => current.filter((item) => item.id !== id));
  }, []);

  return { guideTeachers, isLoading, error, reload: load, upsert, remove };
}

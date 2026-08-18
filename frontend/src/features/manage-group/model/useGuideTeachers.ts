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
      const teachers = await guideTeacherApi.list();
      setGuideTeachers(
        teachers
          .filter((teacher) => teacher.name)
          .map((teacher) => ({ id: teacher.id, name: teacher.name })),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los docentes guía.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { guideTeachers, isLoading, error, reload: load };
}

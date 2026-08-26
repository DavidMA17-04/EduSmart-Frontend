import { useCallback, useEffect, useState } from 'react';
import type { AcademicGroup, CreateGroupPayload } from '@/entities/group';

export interface GroupFormValues { name: string; studentCount: number; sectionId: string; guideTeacherId: string; }
const defaultValues: GroupFormValues = { name: '', studentCount: 0, sectionId: '', guideTeacherId: '' };

export function useGroupForm(group?: AcademicGroup) {
  const [values, setValues] = useState<GroupFormValues>(defaultValues);
  useEffect(() => {
    setValues(group
      ? {
          name: group.name,
          studentCount: group.studentCount,
          sectionId: String(group.sectionId),
          guideTeacherId: group.guideTeacherId == null ? '' : String(group.guideTeacherId),
        }
      : defaultValues);
  }, [group]);
  const setField = useCallback(<K extends keyof GroupFormValues>(field: K, value: GroupFormValues[K]) => setValues((current) => ({ ...current, [field]: value })), []);
  const toPayload = useCallback((): CreateGroupPayload => ({
    name: values.name.trim(),
    studentCount: values.studentCount,
    sectionId: Number(values.sectionId),
    guideTeacherId: values.guideTeacherId ? Number(values.guideTeacherId) : null,
  }), [values]);
  return { values, setField, toPayload };
}

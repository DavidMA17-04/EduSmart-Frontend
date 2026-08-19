import { useCallback, useEffect, useState } from 'react';
import type { AcademicGroup, CreateGroupPayload } from '@/entities/group';

export interface GroupFormValues { name: string; studentCount: number; sectionId: string; guideTeacherId: string; }
const defaultValues: GroupFormValues = { name: '', studentCount: 0, sectionId: '', guideTeacherId: '' };

export function useGroupForm(group?: AcademicGroup) {
  const [values, setValues] = useState<GroupFormValues>(defaultValues);
  useEffect(() => { setValues(group ? { name: group.name, studentCount: group.studentCount, sectionId: group.sectionId, guideTeacherId: group.guideTeacherId ?? '' } : defaultValues); }, [group]);
  const setField = useCallback(<K extends keyof GroupFormValues>(field: K, value: GroupFormValues[K]) => setValues((current) => ({ ...current, [field]: value })), []);
  const toPayload = useCallback((): CreateGroupPayload => ({ name: values.name.trim(), studentCount: values.studentCount, sectionId: values.sectionId, guideTeacherId: values.guideTeacherId || undefined }), [values]);
  return { values, setField, toPayload };
}
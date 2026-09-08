import { useCallback, useEffect, useState } from 'react';
import type { AcademicGroup, CreateGroupPayload } from '@/entities/group';
import { type EmptyableNumber, toOptionalCount } from '@/shared/lib/number-input';

export interface GroupFormValues {
  name: string;
  studentCount: EmptyableNumber;
  sectionId: string;
  specialtyId: string;
  guideTeacherId: string;
}
const defaultValues: GroupFormValues = {
  name: '',
  studentCount: '',
  sectionId: '',
  specialtyId: '',
  guideTeacherId: '',
};

export function useGroupForm(group?: AcademicGroup) {
  const [values, setValues] = useState<GroupFormValues>(defaultValues);
  useEffect(() => {
    setValues(group
      ? {
          name: group.name,
          studentCount: group.studentCount,
          sectionId: String(group.sectionId),
          specialtyId: group.specialtyId == null ? '' : String(group.specialtyId),
          guideTeacherId: group.guideTeacherId == null ? '' : String(group.guideTeacherId),
        }
      : defaultValues);
  }, [group]);
  const setField = useCallback(<K extends keyof GroupFormValues>(field: K, value: GroupFormValues[K]) => setValues((current) => ({ ...current, [field]: value })), []);
  const toPayload = useCallback((): CreateGroupPayload => ({
    name: values.name.trim(),
    studentCount: toOptionalCount(values.studentCount),
    sectionId: Number(values.sectionId),
    specialtyId: values.specialtyId ? Number(values.specialtyId) : null,
    guideTeacherId: values.guideTeacherId ? Number(values.guideTeacherId) : null,
  }), [values]);
  return { values, setField, toPayload };
}

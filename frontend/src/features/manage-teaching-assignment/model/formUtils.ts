import type { AcademicOfferingKind } from '@/entities/teaching-assignment';
import type { CreateTeachingAssignmentPayload } from '@/entities/teaching-assignment';

export type TeachingAssignmentFormValues = {
  userId: string;
  /** Edit mode / legacy single group */
  groupId: string;
  /** Create mode: one or more groups */
  groupIds: string[];
  academicPeriodId: string;
  offeringKind: AcademicOfferingKind | '';
  subjectId: string;
  specialtyId: string;
};

export const EMPTY_TEACHING_ASSIGNMENT_FORM: TeachingAssignmentFormValues = {
  userId: '',
  groupId: '',
  groupIds: [],
  academicPeriodId: '',
  offeringKind: '',
  subjectId: '',
  specialtyId: '',
};

export function buildCreatePayload(
  values: TeachingAssignmentFormValues,
): CreateTeachingAssignmentPayload {
  const offeringKind = values.offeringKind as AcademicOfferingKind;
  const groupIds = values.groupIds
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);

  const base: CreateTeachingAssignmentPayload = {
    userId: Number(values.userId),
    groupIds,
    offeringKind,
    academicPeriodId: values.academicPeriodId
      ? Number(values.academicPeriodId)
      : null,
  };

  if (offeringKind === 'SUBJECT') {
    return {
      ...base,
      subjectId: Number(values.subjectId),
      specialtyId: null,
    };
  }

  return {
    ...base,
    subjectId: null,
    specialtyId: Number(values.specialtyId),
  };
}

export function buildUpdatePayload(
  values: TeachingAssignmentFormValues,
): Omit<CreateTeachingAssignmentPayload, 'userId' | 'groupId' | 'groupIds'> {
  const offeringKind = values.offeringKind as AcademicOfferingKind;
  const base = {
    offeringKind,
    academicPeriodId: values.academicPeriodId
      ? Number(values.academicPeriodId)
      : null,
  };

  if (offeringKind === 'SUBJECT') {
    return {
      ...base,
      subjectId: Number(values.subjectId),
      specialtyId: null,
    };
  }

  return {
    ...base,
    subjectId: null,
    specialtyId: Number(values.specialtyId),
  };
}

export function validateTeachingAssignmentForm(
  values: TeachingAssignmentFormValues,
  options: { requireTeacherAndGroup: boolean },
): string | null {
  if (options.requireTeacherAndGroup) {
    if (!values.userId) return 'Seleccione un docente.';
    if (!values.groupIds.length) return 'Seleccione al menos un grupo.';
  }
  if (!values.academicPeriodId) return 'Seleccione un curso lectivo.';
  if (!values.offeringKind) return 'Seleccione el tipo de oferta.';
  if (values.offeringKind === 'SUBJECT') {
    if (!values.subjectId) return 'Seleccione una materia.';
  } else if (!values.specialtyId) {
    return values.offeringKind === 'EXPLORATORY_WORKSHOP'
      ? 'Seleccione un taller exploratorio.'
      : 'Seleccione una carrera técnica.';
  }
  return null;
}

import type { AcademicOfferingKind } from '@/entities/teaching-assignment';
import type { CreateTeachingAssignmentPayload } from '@/entities/teaching-assignment';

export type TeachingAssignmentFormValues = {
  userId: string;
  groupId: string;
  academicPeriodId: string;
  offeringKind: AcademicOfferingKind | '';
  subjectId: string;
  specialtyId: string;
};

export const EMPTY_TEACHING_ASSIGNMENT_FORM: TeachingAssignmentFormValues = {
  userId: '',
  groupId: '',
  academicPeriodId: '',
  offeringKind: '',
  subjectId: '',
  specialtyId: '',
};

export function buildCreatePayload(
  values: TeachingAssignmentFormValues,
): CreateTeachingAssignmentPayload {
  const offeringKind = values.offeringKind as AcademicOfferingKind;
  const base: CreateTeachingAssignmentPayload = {
    userId: Number(values.userId),
    groupId: Number(values.groupId),
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
): Omit<CreateTeachingAssignmentPayload, 'userId' | 'groupId'> {
  const { userId: _u, groupId: _g, ...rest } = buildCreatePayload(values);
  return rest;
}

export function validateTeachingAssignmentForm(
  values: TeachingAssignmentFormValues,
  options: { requireTeacherAndGroup: boolean },
): string | null {
  if (options.requireTeacherAndGroup) {
    if (!values.userId) return 'Seleccione un docente.';
    if (!values.groupId) return 'Seleccione un grupo.';
  }
  if (!values.academicPeriodId) return 'Seleccione un período académico.';
  if (!values.offeringKind) return 'Seleccione el tipo de oferta.';
  if (values.offeringKind === 'SUBJECT') {
    if (!values.subjectId) return 'Seleccione una materia.';
  } else if (!values.specialtyId) {
    return values.offeringKind === 'EXPLORATORY_WORKSHOP'
      ? 'Seleccione un taller exploratorio.'
      : 'Seleccione una especialidad técnica.';
  }
  return null;
}

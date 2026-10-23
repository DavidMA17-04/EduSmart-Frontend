export type EnrollStudentFormValues = {
  userId: string;
  startsOn: string;
};

export const EMPTY_ENROLL_FORM: EnrollStudentFormValues = {
  userId: '',
  startsOn: new Date().toISOString().slice(0, 10),
};

export function validateEnrollStudentForm(
  values: EnrollStudentFormValues,
): Partial<Record<keyof EnrollStudentFormValues, string>> {
  const errors: Partial<Record<keyof EnrollStudentFormValues, string>> = {};
  const userId = Number(values.userId);
  if (!Number.isInteger(userId) || userId < 1) {
    errors.userId = 'Seleccione un estudiante.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.startsOn.trim())) {
    errors.startsOn = 'Indique la fecha de inicio (AAAA-MM-DD).';
  }
  return errors;
}

export function buildCreateEnrollmentPayload(
  groupId: number,
  values: EnrollStudentFormValues,
) {
  return {
    userId: Number(values.userId),
    groupId,
    startsOn: values.startsOn.trim(),
  };
}

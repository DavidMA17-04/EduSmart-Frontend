import { useCallback, useEffect, useState } from 'react';
import type { GuideTeacher } from '@/entities/group';
import { digitsOnly, isValidEmail, isValidNationalId } from '@/features/manage-user/model/userFormRules';

export interface GuideTeacherFormValues {
  nationalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const defaultValues: GuideTeacherFormValues = {
  nationalId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

export function useGuideTeacherForm(teacher?: GuideTeacher) {
  const [values, setValues] = useState<GuideTeacherFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof GuideTeacherFormValues, string>>>({});

  useEffect(() => {
    setValues(teacher
      ? {
          nationalId: teacher.nationalId,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phone: teacher.phone ?? '',
        }
      : defaultValues);
    setErrors({});
  }, [teacher]);

  const setField = useCallback(<K extends keyof GuideTeacherFormValues>(field: K, value: GuideTeacherFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const validate = useCallback(() => {
    const next: Partial<Record<keyof GuideTeacherFormValues, string>> = {};
    if (!values.nationalId.trim()) next.nationalId = 'La cédula es requerida.';
    else if (!isValidNationalId(values.nationalId)) next.nationalId = 'La cédula debe tener entre 9 y 12 dígitos.';
    if (!values.firstName.trim()) next.firstName = 'El nombre es requerido.';
    if (!values.lastName.trim()) next.lastName = 'Los apellidos son requeridos.';
    if (!values.email.trim()) next.email = 'El correo es requerido.';
    else if (!isValidEmail(values.email)) next.email = 'El formato de correo no es válido.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [values]);

  const toPayload = useCallback(() => ({
    nationalId: digitsOnly(values.nationalId),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim() || undefined,
  }), [values]);

  return { values, errors, setField, validate, toPayload };
}

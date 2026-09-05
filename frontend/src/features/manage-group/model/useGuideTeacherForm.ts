import { useCallback, useEffect, useState } from 'react';
import type { CreateGuideTeacherPayload, GuideTeacher } from '@/entities/group';
import { digitsOnly, isValidEmail, isValidNationalId } from '@/features/manage-user/model/userFormRules';
import { splitLastNames } from '@/features/manage-user/model/useUserForm';

export interface GuideTeacherFormValues {
  nationalId: string;
  firstName: string;
  firstLastname: string;
  secondLastname: string;
  email: string;
  phone: string;
}

const defaultValues: GuideTeacherFormValues = {
  nationalId: '',
  firstName: '',
  firstLastname: '',
  secondLastname: '',
  email: '',
  phone: '',
};

function teacherToFormValues(teacher: GuideTeacher): GuideTeacherFormValues {
  const split = splitLastNames(teacher.lastName);
  return {
    nationalId: teacher.nationalId,
    firstName: teacher.firstName,
    firstLastname: split.first_lastname,
    secondLastname: split.second_lastname ?? '',
    email: teacher.email,
    phone: teacher.phone ?? '',
  };
}

export function useGuideTeacherForm(teacher?: GuideTeacher) {
  const [values, setValues] = useState<GuideTeacherFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof GuideTeacherFormValues, string>>>({});

  useEffect(() => {
    setValues(teacher ? teacherToFormValues(teacher) : defaultValues);
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
    if (!values.firstLastname.trim()) next.firstLastname = 'El primer apellido es requerido.';
    if (!values.email.trim()) next.email = 'El correo es requerido.';
    else if (!isValidEmail(values.email)) next.email = 'El formato de correo no es válido.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [values]);

  const toPayload = useCallback((): CreateGuideTeacherPayload => {
    const second = values.secondLastname.trim();
    return {
      nationalId: digitsOnly(values.nationalId),
      name: values.firstName.trim(),
      first_lastname: values.firstLastname.trim(),
      second_lastname: second || undefined,
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim() || undefined,
    };
  }, [values]);

  return { values, errors, setField, validate, toPayload };
}

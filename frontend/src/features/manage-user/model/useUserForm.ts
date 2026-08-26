import { useState } from 'react';
import type { CreateUserPayload, UserAccountStatus } from '@/entities/user';
import {
  digitsOnly,
  isValidEmail,
  isValidInitialPassword,
  isValidNationalId,
} from './userFormRules';

export interface UserFormValues {
  nationalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  status: UserAccountStatus;
  roleIds: string[];
}

export const emptyUserForm: UserFormValues = {
  nationalId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  status: 'ACTIVE',
  roleIds: [],
};

export function validateUserForm(values: UserFormValues): Partial<Record<keyof UserFormValues, string>> {
  const errors: Partial<Record<keyof UserFormValues, string>> = {};

  if (!values.nationalId.trim()) {
    errors.nationalId = 'La cédula es requerida.';
  } else if (!isValidNationalId(values.nationalId)) {
    errors.nationalId = 'La cédula debe tener entre 9 y 12 dígitos.';
  }

  if (!values.firstName.trim()) errors.firstName = 'El nombre es requerido.';
  if (!values.lastName.trim()) errors.lastName = 'Los apellidos son requeridos.';

  if (!values.email.trim()) {
    errors.email = 'El correo es requerido.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'El formato de correo no es válido.';
  }

  if (values.password.trim() && !isValidInitialPassword(values.password)) {
    errors.password = 'La contraseña inicial debe tener entre 8 y 72 caracteres.';
  }

  if (values.roleIds.length === 0) {
    errors.roleIds = 'Debe asignar al menos un rol.';
  }

  return errors;
}

export function toCreatePayload(values: UserFormValues): CreateUserPayload {
  const password = values.password.trim();
  return {
    nationalId: digitsOnly(values.nationalId),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim() || undefined,
    password: password || undefined,
    status: values.status,
    roleIds: values.roleIds,
  };
}

export function useUserForm(initial: UserFormValues = emptyUserForm) {
  const [values, setValues] = useState<UserFormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});

  const onChange = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors = validateUserForm(values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return { values, errors, setErrors, setValues, onChange, validate };
}

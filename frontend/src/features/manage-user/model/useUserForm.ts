import { useState } from 'react';
import type { CreateUserPayload, UserAccountStatus } from '@/entities/user';
import { resolveCreateGroupId } from './sectionEnrollmentForm';
import {
  digitsOnly,
  isValidEmail,
  isValidInitialPassword,
  isValidNationalId,
} from './userFormRules';

export type UserFormMode = 'create' | 'edit';

export interface UserFormValues {
  nationalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  /** Solo UI; nunca se envía al API. */
  confirmPassword: string;
  status: UserAccountStatus;
  roleIds: number[];
  /** Obligatorio si el rol Docente está seleccionado. */
  departmentId: number | '';
  /** Obligatorio si el rol Estudiante está seleccionado y el estado es Activa. */
  groupId: number | '';
}

export const emptyUserForm: UserFormValues = {
  nationalId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  status: 'ACTIVE',
  roleIds: [],
  departmentId: '',
  groupId: '',
};

export function validateUserForm(
  values: UserFormValues,
  mode: UserFormMode = 'create',
  options?: { requiresDepartment?: boolean; requiresGroup?: boolean },
): Partial<Record<keyof UserFormValues, string>> {
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

  if (mode === 'create') {
    if (!values.password.trim()) {
      errors.password = 'La contraseña temporal es requerida.';
    } else if (!isValidInitialPassword(values.password)) {
      errors.password = 'La contraseña temporal debe tener entre 8 y 72 caracteres.';
    }

    if (!values.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirme la contraseña temporal.';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }
  } else if (values.password.trim() && !isValidInitialPassword(values.password)) {
    errors.password = 'La nueva contraseña debe tener entre 8 y 72 caracteres.';
  }

  if (values.roleIds.length === 0) {
    errors.roleIds = 'Debe asignar al menos un rol.';
  }

  if (options?.requiresDepartment && !values.departmentId) {
    errors.departmentId = 'El departamento es obligatorio para docentes.';
  }

  if (options?.requiresGroup && !values.groupId) {
    errors.groupId = 'La sección es obligatoria para un estudiante activo.';
  }

  return errors;
}

export function splitLastNames(lastName: string): { first_lastname: string; second_lastname?: string } {
  const parts = lastName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_lastname: '' };
  if (parts.length === 1) return { first_lastname: parts[0] };
  return {
    first_lastname: parts[0],
    second_lastname: parts.slice(1).join(' '),
  };
}

export function toCreatePayload(
  values: UserFormValues,
  options?: { studentRoleSelected?: boolean },
): CreateUserPayload {
  const password = values.password.trim();
  const { first_lastname, second_lastname } = splitLastNames(values.lastName);
  const studentRoleSelected = options?.studentRoleSelected ?? false;
  return {
    nationalId: digitsOnly(values.nationalId),
    name: values.firstName.trim(),
    first_lastname,
    second_lastname,
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim() || undefined,
    password: password || undefined,
    status: values.status,
    roleIds: values.roleIds,
    departmentId:
      typeof values.departmentId === 'number' ? values.departmentId : undefined,
    groupId: resolveCreateGroupId({
      studentRoleSelected,
      status: values.status,
      groupId: values.groupId,
    }),
  };
}

export function useUserForm(initial: UserFormValues = emptyUserForm) {
  const [values, setValues] = useState<UserFormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});

  const onChange = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const validate = (
    mode: UserFormMode = 'create',
    options?: { requiresDepartment?: boolean; requiresGroup?: boolean },
  ) => {
    const nextErrors = validateUserForm(values, mode, options);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return { values, errors, setErrors, setValues, onChange, validate };
}

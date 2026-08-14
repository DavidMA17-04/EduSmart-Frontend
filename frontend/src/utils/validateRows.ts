import { UserRole, RawRowData, RowValidationError } from '@/types/user';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NATIONAL_ID_REGEX = /^[0-9]{9,12}$/; // Formato de cédula física o DIMEX en CR

export const validateRow = (data: RawRowData): RowValidationError[] => {
  const errors: RowValidationError[] = [];

  // Validar Cédula
  const trimmedId = data.nationalId?.trim() || '';
  if (!trimmedId) {
    errors.push({
      field: 'nationalId',
      code: 'REQUIRED',
      message: 'La cédula de identidad es requerida.',
    });
  } else if (!NATIONAL_ID_REGEX.test(trimmedId.replace(/-/g, ''))) {
    errors.push({
      field: 'nationalId',
      code: 'INVALID_NATIONAL_ID',
      message: 'Formato de cédula no válido (debe tener entre 9 y 12 dígitos).',
    });
  }

  // Validar Nombre
  if (!data.firstName?.trim()) {
    errors.push({
      field: 'firstName',
      code: 'REQUIRED',
      message: 'El nombre es requerido.',
    });
  }

  // Validar Apellidos
  if (!data.lastName?.trim()) {
    errors.push({
      field: 'lastName',
      code: 'REQUIRED',
      message: 'Los apellidos son requeridos.',
    });
  }

  // Validar Correo
  const trimmedEmail = data.email?.trim() || '';
  if (!trimmedEmail) {
    errors.push({
      field: 'email',
      code: 'REQUIRED',
      message: 'El correo electrónico es requerido.',
    });
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push({
      field: 'email',
      code: 'INVALID_EMAIL',
      message: 'Formato de correo electrónico no válido.',
    });
  }

  // Validar Rol
  const roleStr = String(data.role || '').toUpperCase().trim();
  const validRoles = Object.values(UserRole);
  const isValidRole = validRoles.includes(roleStr as UserRole);

  if (!roleStr) {
    errors.push({
      field: 'role',
      code: 'REQUIRED',
      message: 'El rol institucional es requerido.',
    });
  } else if (!isValidRole) {
    errors.push({
      field: 'role',
      code: 'INVALID_ROLE',
      message: `Rol '${data.role}' no reconocido. Permitidos: ESTUDIANTE, DOCENTE, ADMINISTRATIVO, DIRECTIVO.`,
    });
  }

  return errors;
};

import { ImportedUserRecord } from '@/pages/Admin/Users/mocks/importedUsersMock';
import {
  BULK_IMPORT_NATIONAL_ID_ERROR,
  isValidBulkImportNationalId,
  isValidEmail,
} from '@/features/manage-user/model/userFormRules';

const VALID_ROLES = ['ESTUDIANTE', 'DOCENTE', 'ADMINISTRATIVO', 'DIRECTIVO'] as const;
type ValidRole = (typeof VALID_ROLES)[number];

const ROLE_ALIASES: Record<string, ValidRole> = {
  estudiante: 'ESTUDIANTE',
  student: 'ESTUDIANTE',
  docente: 'DOCENTE',
  profesor: 'DOCENTE',
  teacher: 'DOCENTE',
  administrativo: 'ADMINISTRATIVO',
  administrador: 'ADMINISTRATIVO',
  admin: 'ADMINISTRATIVO',
  directivo: 'DIRECTIVO',
  director: 'DIRECTIVO',
};

const BACKEND_INVALID_FIELD_MAP: Record<string, keyof ImportedUserRecord | 'identification' | 'names' | 'firstLastname' | 'email' | 'role' | 'section' | 'phone' | 'userStatus'> = {
  national_id: 'identification',
  name: 'names',
  first_lastname: 'firstLastname',
  second_lastname: 'secondLastname',
  email: 'email',
  role: 'role',
  section: 'section',
  phone: 'phone',
  user_status: 'userStatus',
  identification: 'identification',
  names: 'names',
  firstLastname: 'firstLastname',
};

export function normalizePreviewRole(raw: string): ValidRole | null {
  const key = raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!key) {
    return 'ESTUDIANTE';
  }

  return ROLE_ALIASES[key] ?? (VALID_ROLES.includes(key as ValidRole) ? (key as ValidRole) : null);
}

export function mapBackendInvalidFields(fields?: string[]): string[] {
  if (!fields?.length) {
    return [];
  }

  return fields.map((field) => BACKEND_INVALID_FIELD_MAP[field] ?? field);
}

/** Detecta mensajes de conflicto con BD emitidos por el backend. */
export function hasDbNationalIdConflict(messages?: string[]): boolean {
  return (messages ?? []).some((m) => m.includes('ya existe en la base de datos'));
}

export function hasDbEmailConflict(messages?: string[]): boolean {
  return (messages ?? []).some((m) => m.includes('ya se encuentra registrado en el sistema'));
}

export function validateImportPreviewRow(
  row: ImportedUserRecord,
  allRows: ImportedUserRecord[],
): ImportedUserRecord {
  const errorMessages: string[] = [];
  const warningMessages: string[] = [];
  const invalidFields: string[] = [];

  const identification = row.identification.trim();
  const names = row.names.trim();
  const firstLastname = row.firstLastname.trim();
  const email = row.email.trim().toLowerCase();
  const normalizedRole = normalizePreviewRole(row.role);

  if (!identification) {
    invalidFields.push('identification');
    errorMessages.push('La identificación (cédula) es obligatoria.');
  } else {
    if (!isValidBulkImportNationalId(identification)) {
      invalidFields.push('identification');
      errorMessages.push(BULK_IMPORT_NATIONAL_ID_ERROR);
    }

    const idLower = identification.toLowerCase();
    const duplicateInFile = allRows.some(
      (other) => other.id !== row.id && other.identification.trim().toLowerCase() === idLower,
    );
    if (duplicateInFile) {
      invalidFields.push('identification');
      errorMessages.push(`Cédula duplicada dentro del archivo (${identification}).`);
    }

    // Re-aplicar conflicto BD si la cédula no cambió respecto al validate inicial
    if (
      row.dbConflictNationalId &&
      row.dbConflictNationalId.trim().toLowerCase() === idLower
    ) {
      if (!invalidFields.includes('identification')) {
        invalidFields.push('identification');
      }
      errorMessages.push(`La cédula (${identification}) ya existe en la base de datos.`);
    }
  }

  if (!names) {
    invalidFields.push('names');
    errorMessages.push('El nombre es obligatorio.');
  }

  if (!firstLastname) {
    invalidFields.push('firstLastname');
    errorMessages.push('El primer apellido es obligatorio.');
  }

  if (!email) {
    invalidFields.push('email');
    errorMessages.push('El correo electrónico es obligatorio.');
  } else {
    if (!isValidEmail(email)) {
      invalidFields.push('email');
      errorMessages.push('Formato de correo electrónico inválido.');
    }

    const duplicateEmail = allRows.some(
      (other) => other.id !== row.id && other.email.trim().toLowerCase() === email,
    );
    if (duplicateEmail) {
      invalidFields.push('email');
      errorMessages.push(`Correo electrónico duplicado dentro del archivo (${email}).`);
    }

    // Re-aplicar conflicto BD si el correo no cambió respecto al validate inicial
    if (
      row.dbConflictEmail &&
      row.dbConflictEmail.trim().toLowerCase() === email
    ) {
      if (!invalidFields.includes('email')) {
        invalidFields.push('email');
      }
      errorMessages.push(`El correo (${email}) ya se encuentra registrado en el sistema.`);
    }
  }

  if (!normalizedRole) {
    invalidFields.push('role');
    errorMessages.push(
      `Rol '${row.role}' no válido. Valores permitidos: Estudiante, Docente, Administrativo, Directivo.`,
    );
  }

  if (normalizedRole === 'ESTUDIANTE' && !row.section?.trim()) {
    if (!invalidFields.includes('section')) {
      invalidFields.push('section');
    }
    warningMessages.push('Estudiante sin sección académica asignada.');
  }

  if (row.phone && row.phone.replace(/\D/g, '').length < 8) {
    if (!invalidFields.includes('phone')) {
      invalidFields.push('phone');
    }
    warningMessages.push('Número de teléfono parece incompleto.');
  }

  let status: ImportedUserRecord['status'] = 'VALID';
  if (errorMessages.length > 0) {
    status = 'ERROR';
  } else if (warningMessages.length > 0) {
    status = 'WARNING';
  }

  return {
    ...row,
    role: (normalizedRole ?? row.role) as ImportedUserRecord['role'],
    userStatus:
      row.userStatus === 'INACTIVE'
        ? 'INACTIVE'
        : row.userStatus === 'BLOCKED'
          ? 'BLOCKED'
          : 'ACTIVE',
    status,
    errorMessages,
    warningMessages,
    invalidFields: invalidFields.length > 0 ? invalidFields : undefined,
  };
}

export function revalidateImportPreviewRecords(
  records: ImportedUserRecord[],
): ImportedUserRecord[] {
  return records.map((row) => validateImportPreviewRow(row, records));
}

export interface ImportPreviewBreakdown {
  duplicateNationalIdInFile: number;
  duplicateNationalIdInDb: number;
  duplicateEmailInFile: number;
  duplicateEmailInDb: number;
  requiredFieldsMissing: number;
  invalidEmail: number;
}

export function computeImportPreviewBreakdown(
  records: ImportedUserRecord[],
): ImportPreviewBreakdown {
  const breakdown: ImportPreviewBreakdown = {
    duplicateNationalIdInFile: 0,
    duplicateNationalIdInDb: 0,
    duplicateEmailInFile: 0,
    duplicateEmailInDb: 0,
    requiredFieldsMissing: 0,
    invalidEmail: 0,
  };

  records.forEach((row) => {
    (row.errorMessages ?? []).forEach((message) => {
      const lower = message.toLowerCase();

      if (lower.includes('duplicada dentro del archivo') && lower.includes('cédula')) {
        breakdown.duplicateNationalIdInFile += 1;
      } else if (lower.includes('ya existe en la base de datos')) {
        breakdown.duplicateNationalIdInDb += 1;
      } else if (lower.includes('duplicado dentro del archivo') && lower.includes('correo')) {
        breakdown.duplicateEmailInFile += 1;
      } else if (lower.includes('ya se encuentra registrado en el sistema')) {
        breakdown.duplicateEmailInDb += 1;
      } else if (
        message.includes('obligatoria') ||
        message.includes('obligatorio')
      ) {
        breakdown.requiredFieldsMissing += 1;
      } else if (message.includes('Formato de correo')) {
        breakdown.invalidEmail += 1;
      }
    });
  });

  return breakdown;
}

export function hasAnyDuplicateInconsistency(breakdown: ImportPreviewBreakdown): boolean {
  return (
    breakdown.duplicateNationalIdInFile > 0 ||
    breakdown.duplicateNationalIdInDb > 0 ||
    breakdown.duplicateEmailInFile > 0 ||
    breakdown.duplicateEmailInDb > 0
  );
}

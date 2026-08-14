export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  DIRECTIVE = 'DIRECTIVE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export interface UserInputDTO {
  nationalId: string; // Cédula de Identidad de Costa Rica
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface User extends UserInputDTO {
  id: string;
  status: UserStatus;
  createdAt?: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'Estudiante',
  [UserRole.TEACHER]: 'Docente',
  [UserRole.ADMINISTRATIVE]: 'Administrativo',
  [UserRole.DIRECTIVE]: 'Directivo',
};

export type UserFieldKey = keyof Pick<UserInputDTO, 'nationalId' | 'firstName' | 'lastName' | 'email' | 'role'>;

export type ValidationErrorCode = 
  | 'REQUIRED' 
  | 'INVALID_EMAIL' 
  | 'INVALID_NATIONAL_ID' 
  | 'INVALID_ROLE' 
  | 'DUPLICATE_IN_FILE';

export interface RowValidationError {
  field: UserFieldKey;
  code: ValidationErrorCode;
  message: string;
}

export interface RawRowData {
  nationalId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | UserRole;
}

export interface ImportedUserRow {
  tempId: string;
  rowNumber: number;
  data: RawRowData;
  isValid: boolean;
  errors: RowValidationError[];
}

export interface ImportSummary {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  fileName: string | null;
  fileSizeBytes: number | null;
}

export type ImportStep = 'SELECT_METHOD' | 'UPLOAD_FILE' | 'PREVIEW_DATA' | 'COMPLETE';

export type ImportFilter = 'ALL' | 'VALID_ONLY' | 'ERRORS_ONLY';

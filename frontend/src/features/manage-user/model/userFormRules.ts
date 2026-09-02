const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NATIONAL_ID_PATTERN = /^[0-9]{9,12}$/;
const BULK_IMPORT_NATIONAL_ID_PATTERN = /^[0-9]{9,30}$/;

export const BULK_IMPORT_NATIONAL_ID_ERROR =
  'La cédula debe contener entre 9 y 30 dígitos.';

export function digitsOnly(value: string): string {
  return value.replace(/-/g, '').trim();
}

export function isValidNationalId(value: string): boolean {
  return NATIONAL_ID_PATTERN.test(digitsOnly(value));
}

export function isValidBulkImportNationalId(value: string): boolean {
  return BULK_IMPORT_NATIONAL_ID_PATTERN.test(digitsOnly(value));
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidInitialPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 72;
}

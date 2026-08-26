const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NATIONAL_ID_PATTERN = /^[0-9]{9,12}$/;

export function digitsOnly(value: string): string {
  return value.replace(/-/g, '').trim();
}

export function isValidNationalId(value: string): boolean {
  return NATIONAL_ID_PATTERN.test(digitsOnly(value));
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidInitialPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 72;
}

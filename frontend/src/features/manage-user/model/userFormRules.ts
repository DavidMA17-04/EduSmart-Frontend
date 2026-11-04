const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NATIONAL_ID_PATTERN = /^[0-9]{9,12}$/;
const BULK_IMPORT_NATIONAL_ID_PATTERN = /^[0-9]{9,30}$/;

export const BULK_IMPORT_NATIONAL_ID_ERROR =
  'La cédula debe contener entre 9 y 30 dígitos.';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export type PasswordRequirementId =
  | 'length'
  | 'lower'
  | 'upper'
  | 'digit'
  | 'special';

export const PASSWORD_REQUIREMENT_LABELS: Record<PasswordRequirementId, string> = {
  length: `Entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres`,
  lower: 'Al menos una letra minúscula',
  upper: 'Al menos una letra mayúscula',
  digit: 'Al menos un número',
  special: 'Al menos un carácter especial (!@#$%&*…)',
};

export const PASSWORD_POLICY_HINT =
  'Debe tener 8–72 caracteres, mayúscula, minúscula, número y un carácter especial.';

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

export function getPasswordRequirements(value: string): Record<PasswordRequirementId, boolean> {
  return {
    length: value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    digit: /\d/.test(value),
    special: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value),
  };
}

export function isValidInitialPassword(value: string): boolean {
  const requirements = getPasswordRequirements(value);
  return Object.values(requirements).every(Boolean);
}

function randomInt(maxExclusive: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % maxExclusive;
}

function pickRandom(chars: string): string {
  return chars[randomInt(chars.length)] ?? chars[0] ?? 'a';
}

function shuffle(chars: string[]): string[] {
  const next = [...chars];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

/** Genera una contraseña que cumple la política institucional. */
export function generateCompliantPassword(length = 12): string {
  const size = Math.max(PASSWORD_MIN_LENGTH, Math.min(PASSWORD_MAX_LENGTH, length));
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = PASSWORD_SPECIAL_CHARS;
  const all = `${lower}${upper}${digits}${special}`;

  const required = [
    pickRandom(lower),
    pickRandom(upper),
    pickRandom(digits),
    pickRandom(special),
  ];

  while (required.length < size) {
    required.push(pickRandom(all));
  }

  return shuffle(required).join('');
}

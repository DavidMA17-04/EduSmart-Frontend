export type EmptyableNumber = number | '';

export function parseNumberField(raw: string): EmptyableNumber {
  if (raw.trim() === '') return '';
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? '' : parsed;
}

export function toOptionalCount(value: EmptyableNumber, fallback = 0): number {
  return value === '' || Number.isNaN(Number(value)) ? fallback : Number(value);
}

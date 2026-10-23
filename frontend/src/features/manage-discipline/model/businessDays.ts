/** Fechas ISO `YYYY-MM-DD` tratadas en UTC para no depender de la zona horaria del navegador. */

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isBusinessDay(iso: string, nonWorkingDays: ReadonlySet<string> = new Set()): boolean {
  const weekday = parseIsoDate(iso).getUTCDay();
  return weekday !== 0 && weekday !== 6 && !nonWorkingDays.has(iso);
}

/** El plazo corre desde el día hábil siguiente al acto. */
export function addBusinessDays(
  startIso: string,
  days: number,
  nonWorkingDays: ReadonlySet<string> = new Set(),
): string {
  const cursor = parseIsoDate(startIso);
  let remaining = days;
  while (remaining > 0) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (isBusinessDay(toIsoDate(cursor), nonWorkingDays)) remaining -= 1;
  }
  return toIsoDate(cursor);
}

export function addNaturalDays(startIso: string, days: number): string {
  const cursor = parseIsoDate(startIso);
  cursor.setUTCDate(cursor.getUTCDate() + days);
  return toIsoDate(cursor);
}

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function todayIso(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

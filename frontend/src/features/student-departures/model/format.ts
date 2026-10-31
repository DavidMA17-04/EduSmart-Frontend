import type { DepartureStatus, DepartureType } from './types';

const TIME_ZONE = 'America/Costa_Rica';

export const STATUS_LABEL: Record<DepartureStatus, string> = {
  AUTHORIZED: 'Autorizado',
  REJECTED: 'Denegado / No coincide',
};

export const TYPE_LABEL: Record<DepartureType, string> = {
  REGULAR: 'Salida regular',
  EARLY: 'Salida anticipada',
  EMERGENCY: 'Emergencia',
};

/** Fecha calendario de Costa Rica (YYYY-MM-DD). */
export function costaRicaToday(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
}

export function formatTime(value: string | Date): string {
  return new Date(value).toLocaleTimeString('es-CR', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  });
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('es-CR', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  });
}

/** "HH:mm" (24 h) → "1:30 p. m." */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, h, m));
  return date.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' });
}

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

export function formatRelative(value: string | Date, now: Date = new Date()): string {
  const seconds = Math.round((new Date(value).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return 'hace un momento';
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour');
  return formatDateTime(value);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function sectionLabel(student: { groupName: string | null; sectionName: string | null }): string {
  return student.groupName ?? student.sectionName ?? 'Sin sección';
}

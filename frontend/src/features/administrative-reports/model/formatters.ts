import { formatAcademicPeriodDate } from '@/entities/academic-period';
import type { BadgeTone } from '@/shared/ui';

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  BLOCKED: 'Bloqueada',
  PENDING: 'Pendiente',
};

const GENERIC_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  BLOCKED: 'Bloqueado',
  PENDING: 'Pendiente',
  PLANNED: 'Planificado',
  CLOSED: 'Cerrado',
  UNDER_REVIEW: 'En revisión',
};

export function formatReportCalendarDate(value: string): string {
  return formatAcademicPeriodDate(value);
}

export function formatReportDateTime(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return formatAcademicPeriodDate(trimmed);
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatReportStatusLabel(status: string, variant: 'user' | 'generic' = 'generic'): string {
  const key = status.trim().toUpperCase();
  const labels = variant === 'user' ? USER_STATUS_LABELS : GENERIC_STATUS_LABELS;
  return labels[key] ?? status;
}

export function reportStatusTone(status: string): BadgeTone {
  switch (status.trim().toUpperCase()) {
    case 'ACTIVE':
      return 'success';
    case 'BLOCKED':
      return 'danger';
    case 'PENDING':
    case 'PLANNED':
    case 'UNDER_REVIEW':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function formatOptionalText(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '—';
}

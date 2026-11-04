import { caseListQuery } from '@/entities/discipline/model/queries';
import type { BadgeTone } from '@/shared/ui';
import type { DeadlineIndicator, DisciplinaryCaseStatus } from './types';

export { caseListQuery };

export const STATUS_LABELS: Record<DisciplinaryCaseStatus, string> = {
  REPORTED: 'Reportada',
  INVESTIGATING: 'En investigación',
  COMMUNICATED: 'Comunicada',
  PENDING_RESOLUTION: 'Pendiente de resolución',
  RESOLVED: 'Resuelta',
  IN_APPEAL: 'En recurso',
  FIRM: 'Firme',
  DISMISSED: 'Desestimada',
  ANNULLED: 'Anulada',
  NOTIFIED: 'Notificada',
};

export const STATUS_TONES: Record<DisciplinaryCaseStatus, BadgeTone> = {
  REPORTED: 'neutral',
  INVESTIGATING: 'warning',
  COMMUNICATED: 'warning',
  PENDING_RESOLUTION: 'warning',
  RESOLVED: 'success',
  IN_APPEAL: 'warning',
  FIRM: 'success',
  DISMISSED: 'neutral',
  ANNULLED: 'danger',
  NOTIFIED: 'success',
};

export const DEADLINE_LABELS: Record<DeadlineIndicator, string> = {
  ON_TIME: 'En plazo',
  DUE_SOON: 'Por vencer',
  OVERDUE: 'Vencido',
  NONE: 'Sin plazo',
};

export const DEADLINE_TONES: Record<DeadlineIndicator, BadgeTone> = {
  ON_TIME: 'success',
  DUE_SOON: 'warning',
  OVERDUE: 'danger',
  NONE: 'neutral',
};


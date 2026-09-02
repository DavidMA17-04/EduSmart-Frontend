import { Badge } from '@/shared/ui';
import { ACADEMIC_PERIOD_STATUS_LABELS } from '../model/formatters';
import type { AcademicPeriodStatus } from '../model/types';

const tones: Record<AcademicPeriodStatus, 'success' | 'neutral' | 'warning'> = {
  PLANNED: 'warning',
  ACTIVE: 'success',
  CLOSED: 'neutral',
};

export const AcademicPeriodStatusBadge = ({ status }: { status: AcademicPeriodStatus }) => (
  <Badge tone={tones[status]}>{ACADEMIC_PERIOD_STATUS_LABELS[status]}</Badge>
);

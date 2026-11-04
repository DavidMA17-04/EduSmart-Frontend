import { StatusBadge, type StatusTone } from '@/shared/ui';
import { ACADEMIC_PERIOD_STATUS_LABELS } from '../model/formatters';
import type { AcademicPeriodStatus } from '../model/types';

const tones: Record<AcademicPeriodStatus, StatusTone> = {
  PLANNED: 'warning',
  ACTIVE: 'active',
  CLOSED: 'closed',
};

export const AcademicPeriodStatusBadge = ({ status }: { status: AcademicPeriodStatus }) => (
  <StatusBadge tone={tones[status]} withDot={status === 'ACTIVE'}>
    {ACADEMIC_PERIOD_STATUS_LABELS[status]}
  </StatusBadge>
);

import { StatusBadge, type StatusTone } from '@/shared/ui';
import { SPECIALTY_STATUS_LABELS } from '../model/formatters';
import type { SpecialtyStatus } from '../model/types';

const tones: Record<SpecialtyStatus, StatusTone> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  UNDER_REVIEW: 'warning',
};

export const SpecialtyStatusBadge = ({ status }: { status: SpecialtyStatus }) => (
  <StatusBadge tone={tones[status]} withDot={status === 'ACTIVE'}>
    {SPECIALTY_STATUS_LABELS[status]}
  </StatusBadge>
);

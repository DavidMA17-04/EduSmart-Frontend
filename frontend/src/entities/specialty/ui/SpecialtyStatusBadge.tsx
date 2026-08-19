import { Badge } from '@/shared/ui';
import { SPECIALTY_STATUS_LABELS } from '../model/formatters';
import type { SpecialtyStatus } from '../model/types';

const tones: Record<SpecialtyStatus, 'success' | 'neutral' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  UNDER_REVIEW: 'warning',
};

export const SpecialtyStatusBadge = ({ status }: { status: SpecialtyStatus }) => <Badge tone={tones[status]}>{SPECIALTY_STATUS_LABELS[status]}</Badge>;
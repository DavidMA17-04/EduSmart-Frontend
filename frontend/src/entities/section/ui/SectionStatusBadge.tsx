import { StatusBadge } from '@/shared/ui';
import { SECTION_STATUS_LABELS } from '../model/formatters';
import type { SectionStatus } from '../model/types';

export const SectionStatusBadge = ({ status }: { status: SectionStatus }) => (
  <StatusBadge tone={status === 'ACTIVE' ? 'active' : 'inactive'} withDot={status === 'ACTIVE'}>
    {SECTION_STATUS_LABELS[status]}
  </StatusBadge>
);

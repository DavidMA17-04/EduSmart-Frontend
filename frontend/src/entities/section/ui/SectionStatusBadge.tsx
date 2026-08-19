import { Badge } from '@/shared/ui';
import { SECTION_STATUS_LABELS } from '../model/formatters';
import type { SectionStatus } from '../model/types';

export const SectionStatusBadge = ({ status }: { status: SectionStatus }) => <Badge tone={status === 'ACTIVE' ? 'success' : 'neutral'}>{SECTION_STATUS_LABELS[status]}</Badge>;
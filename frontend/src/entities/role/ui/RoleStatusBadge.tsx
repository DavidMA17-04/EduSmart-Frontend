import { Badge } from '@/shared/ui';
import type { RoleStatus } from '../model/types';

const statusConfig: Record<RoleStatus, { label: string; tone: 'success' | 'neutral' }> = {
  ACTIVE: { label: 'Activo', tone: 'success' },
  INACTIVE: { label: 'Inactivo', tone: 'neutral' },
};

export const RoleStatusBadge = ({ status }: { status: RoleStatus }) => {
  const config = statusConfig[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
};
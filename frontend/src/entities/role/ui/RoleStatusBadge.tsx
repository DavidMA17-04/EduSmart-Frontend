import { StatusBadge, type StatusTone } from '@/shared/ui';
import type { RoleStatus } from '../model/types';

const statusConfig: Record<RoleStatus, { label: string; tone: StatusTone; withDot?: boolean }> = {
  ACTIVE: { label: 'Activo', tone: 'active', withDot: true },
  INACTIVE: { label: 'Inactivo', tone: 'inactive' },
};

export const RoleStatusBadge = ({ status }: { status: RoleStatus }) => {
  const config = statusConfig[status];
  return (
    <StatusBadge tone={config.tone} withDot={config.withDot}>
      {config.label}
    </StatusBadge>
  );
};

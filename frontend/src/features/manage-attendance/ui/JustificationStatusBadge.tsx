import type { JustificationStatus } from '@/entities/attendance';
import styles from './JustificationStatusBadge.module.css';

const LABELS: Record<JustificationStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
};

export function JustificationStatusBadge({
  status,
}: {
  status: JustificationStatus;
}) {
  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
      {LABELS[status]}
    </span>
  );
}

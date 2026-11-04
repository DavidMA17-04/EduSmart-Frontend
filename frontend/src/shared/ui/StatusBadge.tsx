import type { ReactNode } from 'react';
import styles from './StatusBadge.module.css';

export type StatusTone = 'active' | 'inactive' | 'closed' | 'pending' | 'warning' | 'danger';

const toneClass: Record<StatusTone, string> = {
  active: styles.active,
  inactive: styles.inactive,
  closed: styles.closed,
  pending: styles.pending,
  warning: styles.warning,
  danger: styles.danger,
};

export const StatusBadge = ({
  tone,
  children,
  withDot = false,
}: {
  tone: StatusTone;
  children: ReactNode;
  withDot?: boolean;
}) => (
  <span className={`${styles.badge} ${toneClass[tone]}`}>
    {withDot ? <i className={styles.dot} aria-hidden="true" /> : null}
    {children}
  </span>
);

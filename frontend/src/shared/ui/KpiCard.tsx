import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import styles from './KpiCard.module.css';

export type KpiTone = 'navy' | 'gold' | 'green' | 'warning' | 'danger' | 'muted';

const toneClass: Record<KpiTone, string> = {
  navy: styles.navy,
  gold: styles.gold,
  green: styles.green,
  warning: styles.warning,
  danger: styles.danger,
  muted: styles.muted,
};

export type KpiCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: KpiTone;
  icon?: LucideIcon;
  badge?: ReactNode;
  className?: string;
};

export const KpiCard = ({
  label,
  value,
  hint,
  tone = 'navy',
  icon: Icon,
  badge,
  className = '',
}: KpiCardProps) => (
  <article className={`${styles.card} ${toneClass[tone]} ${className}`.trim()}>
    {Icon ? (
      <span className={styles.icon} aria-hidden="true">
        <Icon size={16} />
      </span>
    ) : null}
    <div className={styles.body}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
      {hint != null && hint !== '' ? <span className={styles.hint}>{hint}</span> : null}
      {badge != null && badge !== '' ? <span className={styles.badge}>{badge}</span> : null}
    </div>
  </article>
);

export const KpiGrid = ({
  children,
  className = '',
  columns,
}: PropsWithChildren<{ className?: string; columns?: number }>) => (
  <div
    className={`${styles.grid} ${className}`.trim()}
    style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
  >
    {children}
  </div>
);

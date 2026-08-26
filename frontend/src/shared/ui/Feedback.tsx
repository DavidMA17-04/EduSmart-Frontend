import type { PropsWithChildren } from 'react';
import styles from './ui.module.css';

export type BadgeTone = 'success' | 'neutral' | 'warning' | 'danger';

const toneClass: Record<BadgeTone, string> = {
  success: styles.badgeSuccess,
  neutral: styles.badgeNeutral,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
};

export const Badge = ({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: BadgeTone }>) => (
  <span className={`${styles.badge} ${toneClass[tone]}`}>{children}</span>
);

export const Alert = ({ children }: PropsWithChildren) => <aside className={styles.alert}>{children}</aside>;

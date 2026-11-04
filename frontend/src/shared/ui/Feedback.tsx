import type { PropsWithChildren } from 'react';
import styles from './ui.module.css';

export type BadgeTone = 'success' | 'neutral' | 'warning' | 'danger';

const badgeToneClass: Record<BadgeTone, string> = {
  success: styles.badgeSuccess,
  neutral: styles.badgeNeutral,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
};

export const Badge = ({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: BadgeTone }>) => (
  <span className={`${styles.badge} ${badgeToneClass[tone]}`}>{children}</span>
);

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const alertToneClass: Record<AlertTone, string> = {
  info: styles.alertInfo,
  success: styles.alertSuccess,
  warning: styles.alertWarning,
  error: styles.alertError,
};

export const Alert = ({
  children,
  tone = 'info',
}: PropsWithChildren<{ tone?: AlertTone }>) => (
  <aside className={`${styles.alert} ${alertToneClass[tone]}`}>{children}</aside>
);

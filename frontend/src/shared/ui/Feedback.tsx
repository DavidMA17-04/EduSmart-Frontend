import type { PropsWithChildren } from 'react';
import styles from './ui.module.css';
export type BadgeTone = 'success' | 'neutral' | 'warning' | 'danger';
export const Badge = ({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: BadgeTone }>) => <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
export const Alert = ({ children }: PropsWithChildren) => <aside className={styles.alert}>{children}</aside>;
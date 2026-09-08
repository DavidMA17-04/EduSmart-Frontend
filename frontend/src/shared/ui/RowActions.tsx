import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './RowActions.module.css';

type Tone = 'default' | 'primary' | 'warning' | 'danger';

export const RowActions = ({ children }: { children: ReactNode }) => (
  <span className={styles.group}>{children}</span>
);

export const RowActionButton = ({
  tone = 'default',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) => (
  <button
    className={`${styles.btn} ${styles[tone]} ${className}`}
    type="button"
    {...props}
  />
);

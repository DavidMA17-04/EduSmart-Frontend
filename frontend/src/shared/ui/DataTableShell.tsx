import type { PropsWithChildren, ReactNode } from 'react';
import styles from './DataTableShell.module.css';

export type DataTableShellProps = PropsWithChildren<{
  toolbar?: ReactNode;
  footer?: ReactNode;
  className?: string;
}>;

export const DataTableShell = ({
  children,
  toolbar,
  footer,
  className = '',
}: DataTableShellProps) => (
  <section className={`${styles.shell} ${className}`}>
    {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
    <div className={styles.body}>{children}</div>
    {footer ? <div className={styles.footer}>{footer}</div> : null}
  </section>
);

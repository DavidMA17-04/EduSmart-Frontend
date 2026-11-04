import type { PropsWithChildren, ReactNode } from 'react';
import { Alert } from './Feedback';
import styles from './FormLayout.module.css';

export type FormLayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
  formError?: string | null;
  actions?: ReactNode;
  className?: string;
}>;

export const FormLayout = ({
  children,
  title,
  description,
  formError,
  actions,
  className = '',
}: FormLayoutProps) => (
  <div className={`${styles.layout} ${className}`}>
    {(title || description) && (
      <header className={styles.head}>
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </header>
    )}
    {formError ? <Alert>{formError}</Alert> : null}
    <div className={styles.fields}>{children}</div>
    {actions ? <div className={styles.actions}>{actions}</div> : null}
  </div>
);

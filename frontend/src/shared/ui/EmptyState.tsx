import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void; icon?: LucideIcon };
  children?: ReactNode;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) => {
  const ActionIcon = action?.icon;
  return (
    <div className={styles.root}>
      <span className={styles.icon} aria-hidden="true">
        <Icon size={28} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action ? (
        <button className={styles.action} onClick={action.onClick} type="button">
          {ActionIcon ? <ActionIcon size={16} aria-hidden="true" /> : null}
          {action.label}
        </button>
      ) : null}
      {children}
    </div>
  );
};

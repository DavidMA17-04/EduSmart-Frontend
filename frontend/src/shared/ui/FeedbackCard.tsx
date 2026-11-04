import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import styles from './FeedbackCard.module.css';

export type FeedbackCardProps = {
  variant?: 'success' | 'error';
  title: string;
  description?: string;
  summary?: ReactNode;
  primaryAction?: { label: string; onClick: () => void; icon?: LucideIcon };
  secondaryAction?: { label: string; onClick: () => void; icon?: LucideIcon };
  links?: Array<{ label: string; to: string }>;
};

export const FeedbackCard = ({
  variant = 'success',
  title,
  description,
  summary,
  primaryAction,
  secondaryAction,
  links,
}: FeedbackCardProps) => {
  const Icon = variant === 'success' ? CheckCircle2 : XCircle;
  const PrimaryIcon = primaryAction?.icon;
  const SecondaryIcon = secondaryAction?.icon;

  return (
    <div className={styles.wrap}>
      <article className={`${styles.card} ${variant === 'error' ? styles.error : styles.success}`}>
        <div className={styles.icon} aria-hidden="true">
          <Icon size={32} />
        </div>
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.lead}>{description}</p> : null}
        {summary ? <div className={styles.summary}>{summary}</div> : null}
        {(primaryAction || secondaryAction) && (
          <div className={styles.actions}>
            {primaryAction ? (
              <button className={styles.btnPrimary} onClick={primaryAction.onClick} type="button">
                {PrimaryIcon ? <PrimaryIcon size={16} aria-hidden="true" /> : null}
                {primaryAction.label}
              </button>
            ) : null}
            {secondaryAction ? (
              <button className={styles.btnSecondary} onClick={secondaryAction.onClick} type="button">
                {SecondaryIcon ? <SecondaryIcon size={16} aria-hidden="true" /> : null}
                {secondaryAction.label}
              </button>
            ) : null}
          </div>
        )}
        {links && links.length > 0 ? (
          <div className={styles.links}>
            {links.map((link) => (
              <Link className={styles.link} key={link.to + link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
};

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './PageHeader.module.css';

export type BreadcrumbItem = { label: string; to?: string };

export type PageHeaderProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  back?: { label: string; to: string };
  primaryAction?: ReactNode;
};

export const PageHeader = ({
  breadcrumbs,
  title,
  subtitle,
  icon: Icon,
  back,
  primaryAction,
}: PageHeaderProps) => (
  <header className={styles.header}>
    <div className={styles.main}>
      <nav aria-label="Miga de pan" className={styles.breadcrumb}>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <span className={styles.crumbItem} key={`${item.label}-${index}`}>
              {index > 0 ? (
                <span aria-hidden="true" className={styles.sep}>
                  ›
                </span>
              ) : null}
              {item.to && !isLast ? (
                <Link className={styles.crumbLink} to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? styles.crumbCurrent : undefined}>{item.label}</span>
              )}
            </span>
          );
        })}
      </nav>
      <div className={styles.titleRow}>
        {Icon ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon size={22} />
          </span>
        ) : null}
        <div className={styles.copy}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {primaryAction ? <div className={styles.primarySlot}>{primaryAction}</div> : null}
      </div>
    </div>
    {back ? (
      <Link className={styles.back} to={back.to}>
        <ArrowLeft size={16} aria-hidden="true" />
        {back.label}
      </Link>
    ) : null}
  </header>
);

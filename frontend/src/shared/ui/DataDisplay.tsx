import type { PropsWithChildren, ReactNode } from 'react';
import { Button } from './Button';
import styles from './ui.module.css';

export type TabItem<T extends string> = { id: T; label: ReactNode };

export function Tabs<T extends string>({ items, value, onChange }: { items: TabItem<T>[]; value: T; onChange: (id: T) => void }) {
  return <div className={styles.tabs} role="tablist">{items.map((item) => <button key={item.id} type="button" role="tab" aria-selected={value === item.id} onClick={() => onChange(item.id)} className={`${styles.tab} ${value === item.id ? styles.tabActive : ''}`}>{item.label}</button>)}</div>;
}

export const Table = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => <div className={styles.tableWrapper}><table className={`${styles.table} ${className}`}>{children}</table></div>;

export const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => (
  <nav className={styles.pagination} aria-label="Paginación">
    <Button
      className={styles.paginationButton}
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
      type="button"
      variant="secondary"
    >
      Anterior
    </Button>
    <span className={styles.paginationInfo}>{currentPage} de {totalPages}</span>
    <Button
      className={styles.paginationButton}
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
      type="button"
      variant="secondary"
    >
      Siguiente
    </Button>
  </nav>
);

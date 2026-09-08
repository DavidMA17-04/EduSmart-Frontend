import type { ReactNode } from 'react';
import styles from './SegmentedTabs.module.css';

export type SegmentedTabItem<T extends string> = { id: T; label: ReactNode };

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  'aria-label': ariaLabel = 'Secciones',
}: {
  items: SegmentedTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  'aria-label'?: string;
}) {
  return (
    <div aria-label={ariaLabel} className={styles.root} role="tablist">
      {items.map((item) => (
        <button
          aria-selected={value === item.id}
          className={`${styles.tab} ${value === item.id ? styles.active : ''}`}
          key={item.id}
          onClick={() => onChange(item.id)}
          role="tab"
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

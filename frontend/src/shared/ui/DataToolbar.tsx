import { useEffect, useRef, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';
import styles from './DataToolbar.module.css';

export type DataToolbarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchShortcut?: boolean;
  filters?: ReactNode;
  primaryAction?: ReactNode;
};

export const DataToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  searchShortcut = false,
  filters,
  primaryAction,
}: DataToolbarProps) => {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchShortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchShortcut]);

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        {onSearchChange !== undefined ? (
          <label className={styles.search}>
            <Search aria-hidden="true" className={styles.searchIcon} size={16} />
            <Input
              aria-label={searchPlaceholder}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              ref={searchRef}
              value={search ?? ''}
            />
            {searchShortcut ? <kbd className={styles.kbd}>/</kbd> : null}
          </label>
        ) : null}
        {filters ? <div className={styles.filters}>{filters}</div> : null}
      </div>
      {primaryAction ? <div className={styles.actions}>{primaryAction}</div> : null}
    </div>
  );
};

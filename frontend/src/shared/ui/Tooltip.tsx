import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import styles from './Tooltip.module.css';

export type TooltipProps = {
  content: string;
  children: ReactNode;
  /** Preferencia de colocación del globo (CSS). */
  placement?: 'top' | 'bottom';
};

/**
 * Tooltip accesible sin dependencias externas.
 * Visible con hover, foco de teclado o toque (toggle en pointer coarse).
 */
export const Tooltip = ({ content, children, placement = 'top' }: TooltipProps) => {
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const trimmed = content.trim();
  if (!trimmed) {
    return <>{children}</>;
  }

  return (
    <span
      className={`${styles.root} ${open ? styles.open : ''}`}
      onBlur={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onPointerDown={(event) => {
        if (event.pointerType === 'touch') {
          event.preventDefault();
          setOpen((current) => !current);
        }
      }}
    >
      <span
        aria-describedby={open ? tipId : undefined}
        className={styles.trigger}
        tabIndex={0}
      >
        {children}
      </span>
      <span
        className={`${styles.bubble} ${placement === 'bottom' ? styles.bottom : styles.top}`}
        id={tipId}
        role="tooltip"
      >
        {trimmed}
      </span>
    </span>
  );
};

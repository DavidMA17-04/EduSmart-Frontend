import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import styles from './AnimatedStep.module.css';

type AnimatedStepProps = {
  stepKey: string;
  children: ReactNode;
};

/**
 * Cross-fades step content and animates host height via ResizeObserver.
 * Cleans up observer on unmount; ignores no-op size updates to avoid loops.
 */
export const AnimatedStep = ({ stepKey, children }: AnimatedStepProps) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const lastHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const node = measureRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      setHeight('auto');
      return;
    }

    const apply = (next: number) => {
      const rounded = Math.round(next);
      if (lastHeight.current !== null && Math.abs(lastHeight.current - rounded) < 1) {
        return;
      }
      lastHeight.current = rounded;
      setHeight(rounded);
    };

    apply(node.getBoundingClientRect().height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      apply(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [stepKey]);

  return (
    <div
      className={styles.host}
      style={{ height: height === 'auto' ? 'auto' : `${height}px` }}
    >
      <div className={styles.measure} key={stepKey} ref={measureRef}>
        <div className={styles.enter}>{children}</div>
      </div>
    </div>
  );
};

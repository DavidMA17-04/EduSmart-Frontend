import styles from './RollingTextLabel.module.css';

type RollingTextLabelProps = {
  text: string;
  className?: string;
};

/**
 * Hover/focus rolling label: two stacked copies split into characters,
 * staggered translateY (Motion-style, CSS-only).
 * Put the accessible name on the parent control (e.g. aria-label).
 */
export const RollingTextLabel = ({ text, className = '' }: RollingTextLabelProps) => {
  const chars = Array.from(text);

  return (
    <span aria-hidden="true" className={`${styles.root} ${className}`.trim()}>
      <span className={styles.window}>
        <span className={`${styles.line} ${styles.outgoing}`}>
          {chars.map((char, index) => (
            <span
              className={styles.char}
              key={`out-${index}`}
              style={{ ['--i' as string]: index }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
        <span className={`${styles.line} ${styles.incoming}`}>
          {chars.map((char, index) => (
            <span
              className={styles.char}
              key={`in-${index}`}
              style={{ ['--i' as string]: index }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
};

import { useState } from 'react';
import { Clock3, X } from 'lucide-react';
import styles from './SessionExpiredNotice.module.css';

/** Aviso en /login cuando la sesión venció mientras la persona trabajaba. */
export function SessionExpiredNotice() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className={styles.notice} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        <Clock3 size={20} strokeWidth={2} />
      </span>
      <div className={styles.text}>
        <strong>Su sesión expiró</strong>
        <span>Por seguridad cerramos la sesión. Inicie sesión de nuevo y volverá a donde estaba.</span>
      </div>
      <button
        aria-label="Cerrar aviso"
        className={styles.close}
        onClick={() => setOpen(false)}
        type="button"
      >
        <X aria-hidden="true" size={16} />
      </button>
      <span className={styles.timer} aria-hidden="true" />
    </div>
  );
}

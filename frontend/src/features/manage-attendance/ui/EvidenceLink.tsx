import { useState } from 'react';
import type { JustificationEvidenceItem } from '@/entities/attendance';
import { attendanceApi } from '../api/attendanceApi';
import styles from './EvidenceLink.module.css';

type Props = {
  evidence: JustificationEvidenceItem;
  className?: string;
};

/** Abre la evidencia con descarga autenticada (sin enlaces a /uploads públicos). */
export function EvidenceLink({ evidence, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    setLoading(true);
    setError(null);
    try {
      await attendanceApi.openJustificationEvidence(evidence);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo abrir la evidencia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.link} ${className ?? ''}`}
        onClick={() => void handleOpen()}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? `Abriendo ${evidence.fileName}…` : evidence.fileName}
      </button>
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </span>
  );
}

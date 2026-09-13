import { useState } from 'react';
import type { JustificationListItem } from '@/entities/attendance';
import { Button } from '@/shared/ui';
import { JustificationStatusBadge } from './JustificationStatusBadge';
import styles from './ReviewJustificationModal.module.css';

type Props = {
  open: boolean;
  item: JustificationListItem | null;
  submitting?: boolean;
  onClose: () => void;
  onDecide: (decision: {
    status: 'APPROVED' | 'REJECTED';
    decisionNotes?: string;
  }) => Promise<void> | void;
};

export function ReviewJustificationModal({
  open,
  item,
  submitting = false,
  onClose,
  onDecide,
}: Props) {
  const [notes, setNotes] = useState('');

  if (!open || !item) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h2>Dictamen de justificación</h2>
            <p>
              {item.student.fullName} · {item.group.name} · {item.offering.name}
            </p>
          </div>
          <JustificationStatusBadge status={item.status} />
        </header>

        <section className={styles.block}>
          <h3>Motivo</h3>
          <p>{item.reason}</p>
        </section>

        <section className={styles.block}>
          <h3>Evidencias</h3>
          {item.evidences.length === 0 ? (
            <p className={styles.muted}>Sin archivos adjuntos.</p>
          ) : (
            <ul className={styles.evidenceList}>
              {item.evidences.map((e) => (
                <li key={e.id}>
                  <a href={e.url} target="_blank" rel="noreferrer">
                    {e.fileName}
                  </a>
                  <span>{Math.round(e.fileSizeBytes / 1024)} KB</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <label className={styles.field}>
          <span>Notas / observaciones</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Obligatorio al rechazar"
          />
        </label>

        <footer className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cerrar
          </Button>
          <button
            type="button"
            className={styles.reject}
            disabled={submitting || notes.trim().length < 3}
            onClick={() =>
              void onDecide({
                status: 'REJECTED',
                decisionNotes: notes.trim(),
              })
            }
          >
            Rechazar
          </button>
          <button
            type="button"
            className={styles.approve}
            disabled={submitting}
            onClick={() =>
              void onDecide({
                status: 'APPROVED',
                decisionNotes: notes.trim() || undefined,
              })
            }
          >
            Aprobar
          </button>
        </footer>
      </div>
    </div>
  );
}

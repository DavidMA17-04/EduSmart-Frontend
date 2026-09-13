import { useMemo, useState } from 'react';
import type { JustifiableAbsenceOption } from '@/entities/attendance';
import { Button } from '@/shared/ui';
import styles from './RequestJustificationModal.module.css';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = /\.(pdf|jpe?g|png)$/i;

type Props = {
  open: boolean;
  absences: JustifiableAbsenceOption[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    attendanceId: number;
    reason: string;
    file: File | null;
  }) => Promise<void> | void;
};

export function RequestJustificationModal({
  open,
  absences,
  submitting = false,
  onClose,
  onSubmit,
}: Props) {
  const [attendanceId, setAttendanceId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const reasonOk = reason.trim().length >= 10;
  const canSubmit = attendanceId !== '' && reasonOk && !submitting;

  const selectedLabel = useMemo(() => {
    if (attendanceId === '') return null;
    return absences.find((a) => a.attendanceId === attendanceId) ?? null;
  }, [absences, attendanceId]);

  if (!open) return null;

  const acceptFile = (next: File | null) => {
    setFileError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!ALLOWED.test(next.name)) {
      setFileError('Solo PDF, JPG, JPEG o PNG.');
      setFile(null);
      return;
    }
    if (next.size > MAX_BYTES) {
      setFileError('El archivo no puede superar 10 MB.');
      setFile(null);
      return;
    }
    setFile(next);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2>Solicitar justificación</h2>
          <p>Indique la ausencia, el motivo y adjunte el comprobante.</p>
        </header>

        <label className={styles.field}>
          <span>Ausencia / lección</span>
          <select
            value={attendanceId === '' ? '' : String(attendanceId)}
            onChange={(e) =>
              setAttendanceId(e.target.value ? Number(e.target.value) : '')
            }
          >
            <option value="">Seleccione una ausencia</option>
            {absences.map((a) => (
              <option key={a.attendanceId} value={a.attendanceId}>
                {a.sessionDate} · {a.offeringName} · {a.groupName}
                {a.studentFullName ? ` · ${a.studentFullName}` : ''}
              </option>
            ))}
          </select>
          {selectedLabel ? (
            <small>
              {selectedLabel.sessionDate} — {selectedLabel.offeringName}
            </small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Motivo detallado</span>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describa el motivo (mínimo 10 caracteres)"
          />
          <small className={reasonOk ? undefined : styles.hintError}>
            {reason.trim().length}/10 caracteres mínimos
          </small>
        </label>

        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            acceptFile(e.dataTransfer.files?.[0] ?? null);
          }}
        >
          <p>Arrastre un comprobante aquí (.pdf, .png, .jpg — máx. 10 MB)</p>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className={styles.preview}>
              <span>{file.name}</span>
              <button type="button" onClick={() => acceptFile(null)}>
                Quitar
              </button>
            </div>
          ) : null}
          {fileError ? <p className={styles.hintError}>{fileError}</p> : null}
        </div>

        <footer className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              void onSubmit({
                attendanceId: Number(attendanceId),
                reason: reason.trim(),
                file,
              })
            }
          >
            {submitting ? 'Enviando…' : 'Enviar Justificación'}
          </Button>
        </footer>
      </div>
    </div>
  );
}

import { useId, useState } from 'react';
import { UserX } from 'lucide-react';
import { Button, Modal, Textarea } from '@/shared/ui';
import styles from './UserDeactivationModal.module.css';

export type UserDeactivationModalProps = {
  isOpen: boolean;
  userLabel?: string;
  isSubmitting?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

export const UserDeactivationModal = ({
  isOpen,
  userLabel,
  isSubmitting = false,
  onConfirm,
  onCancel,
}: UserDeactivationModalProps) => {
  const reasonId = useId();
  const hintId = useId();
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const canConfirm = trimmed.length > 0 && !isSubmitting;

  const handleClose = () => {
    if (isSubmitting) return;
    setReason('');
    onCancel();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(trimmed);
    setReason('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirmar baja de usuario">
      <div className={styles.body}>
        <span className={styles.icon} aria-hidden="true">
          <UserX size={18} />
        </span>
        <p className={styles.message}>
          {userLabel
            ? `Va a inactivar a ${userLabel}. Indique el motivo de baja para dejar constancia en auditoría.`
            : 'Va a inactivar este usuario. Indique el motivo de baja para dejar constancia en auditoría.'}
        </p>
        <label className={styles.field} htmlFor={reasonId}>
          Motivo de baja *
          <Textarea
            aria-describedby={hintId}
            id={reasonId}
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ej. Traslado a otra institución"
            rows={3}
            value={reason}
          />
        </label>
        <p className={styles.hint} id={hintId}>
          El motivo es obligatorio. El botón de confirmación se habilita al escribir un texto válido.
        </p>
        <div className={styles.actions}>
          <Button
            disabled={!canConfirm}
            onClick={handleConfirm}
            type="button"
            variant="danger"
          >
            {isSubmitting ? 'Procesando…' : 'Confirmar baja'}
          </Button>
          <Button disabled={isSubmitting} onClick={handleClose} type="button" variant="secondary">
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

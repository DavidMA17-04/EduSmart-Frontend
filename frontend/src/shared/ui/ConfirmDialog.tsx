import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import styles from './ConfirmDialog.module.css';

export type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  secondary?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger' | 'warning';
  icon?: LucideIcon;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  secondary,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  icon: Icon,
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal
    isOpen={isOpen}
    onClose={() => {
      if (!isSubmitting) onCancel();
    }}
    title={title}
  >
    <div className={styles.body}>
      {Icon ? (
        <span
          className={`${styles.icon} ${tone === 'danger' ? styles.iconDanger : tone === 'warning' ? styles.iconWarning : ''}`}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
      ) : null}
      <div className={styles.message}>{message}</div>
      {secondary ? <p className={styles.secondary}>{secondary}</p> : null}
      <div className={styles.actions}>
        <Button
          disabled={isSubmitting}
          onClick={onConfirm}
          type="button"
          variant={tone === 'danger' ? 'danger' : 'primary'}
        >
          {isSubmitting ? 'Procesando…' : confirmLabel}
        </Button>
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
          {cancelLabel}
        </Button>
      </div>
    </div>
  </Modal>
);

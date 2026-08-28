import { useEffect } from 'react';
import { Lock, Play, RotateCcw } from 'lucide-react';
import { Button, Modal } from '@/shared/ui';
import type { AcademicPeriodTransitionAction } from '../model/useAcademicPeriodsPanel';
import styles from './AcademicPeriodConfirmDialog.module.css';

interface AcademicPeriodConfirmDialogProps {
  action: AcademicPeriodTransitionAction | null;
  periodName: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const COPY: Record<AcademicPeriodTransitionAction, {
  title: string;
  message: (name: string) => string;
  secondary: string;
  confirmLabel: string;
  confirmVariant: 'primary' | 'danger';
  icon: typeof Play;
  iconTone: 'primary' | 'danger';
}> = {
  activate: {
    title: 'Activar período académico',
    message: (name) => `¿Desea activar el período ${name}?`,
    secondary: 'El período pasará al estado Activo.',
    confirmLabel: 'Activar',
    confirmVariant: 'primary',
    icon: Play,
    iconTone: 'primary',
  },
  close: {
    title: 'Cerrar período académico',
    message: (name) => `¿Desea cerrar el período ${name}?`,
    secondary: 'Una vez cerrado, el período no podrá editarse mientras permanezca en este estado.',
    confirmLabel: 'Cerrar',
    confirmVariant: 'danger',
    icon: Lock,
    iconTone: 'danger',
  },
  reopen: {
    title: 'Reabrir período académico',
    message: (name) => `¿Desea reabrir el período ${name}?`,
    secondary: 'El período volverá al estado Planificado.',
    confirmLabel: 'Reabrir',
    confirmVariant: 'primary',
    icon: RotateCcw,
    iconTone: 'primary',
  },
};

export const AcademicPeriodConfirmDialog = ({
  action,
  periodName,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: AcademicPeriodConfirmDialogProps) => {
  const isOpen = action !== null;
  const copy = action ? COPY[action] : null;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isSubmitting) return;
      event.preventDefault();
      onCancel();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!copy) return null;

  const Icon = copy.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onCancel();
      }}
      title={copy.title}
    >
      <div className={styles.body}>
        <span
          className={`${styles.icon} ${copy.iconTone === 'danger' ? styles.iconDanger : ''}`}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
        <p className={styles.message}>{copy.message(periodName)}</p>
        <p className={styles.secondary}>{copy.secondary}</p>
        <div className={styles.actions}>
          <Button
            disabled={isSubmitting}
            onClick={onConfirm}
            type="button"
            variant={copy.confirmVariant}
          >
            {copy.confirmLabel}
          </Button>
          <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

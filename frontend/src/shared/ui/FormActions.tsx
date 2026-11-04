import type { ButtonHTMLAttributes } from 'react';
import { Button } from './Button';
import styles from './ui.module.css';

interface FormActionsProps {
  submitLabel: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  submitProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}

export const FormActions = ({
  submitLabel,
  isSubmitting = false,
  onCancel,
  cancelLabel = 'Cancelar',
  submitProps,
}: FormActionsProps) => (
  <div className={styles.formActions}>
    <Button disabled={isSubmitting} type="submit" {...submitProps}>
      {isSubmitting ? 'Guardando…' : submitLabel}
    </Button>
    {onCancel ? (
      <Button onClick={onCancel} type="button" variant="secondary">
        {cancelLabel}
      </Button>
    ) : null}
  </div>
);

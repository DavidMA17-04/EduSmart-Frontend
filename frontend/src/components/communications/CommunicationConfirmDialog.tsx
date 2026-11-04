import React from 'react';
import { Loader2 } from 'lucide-react';
import { AnimatedModal } from './AnimatedModal';

interface Props {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  tone?: 'primary' | 'danger' | 'warning';
  icon?: React.ReactNode;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE_CLASS: Record<NonNullable<Props['tone']>, string> = {
  primary: 'bg-brand-primary hover:bg-brand-primary-hover',
  danger: 'bg-brand-danger hover:bg-red-700',
  warning: 'bg-brand-warning hover:bg-amber-700',
};

/** Confirmación alineada a FormActions: afirmación luego Cancelar (derecha). */
export const CommunicationConfirmDialog: React.FC<Props> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  tone = 'primary',
  icon,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => (
  <AnimatedModal
    isOpen={isOpen}
    onClose={onCancel}
    locked={isSubmitting}
    size="md"
    title={title}
    icon={icon}
    footer={
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`${TONE_CLASS[tone]} text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60`}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg border border-slate-300 shadow-sm transition-colors"
        >
          Cancelar
        </button>
      </div>
    }
  >
    <div className="px-6 py-5 text-sm text-slate-700 leading-relaxed">{message}</div>
  </AnimatedModal>
);

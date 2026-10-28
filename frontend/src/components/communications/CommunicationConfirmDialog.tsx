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
  primary: 'bg-[#0d2346] hover:bg-[#133261]',
  danger: 'bg-rose-600 hover:bg-rose-700',
  warning: 'bg-amber-600 hover:bg-amber-700',
};

/** Confirmación con el mismo lenguaje visual del módulo (afirmación a la izquierda). */
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
      <div className="flex items-center justify-between gap-3">
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

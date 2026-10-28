import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, Megaphone, ShieldAlert } from 'lucide-react';
import { Communication } from '@/types/communications';
import { useCommunicationDetail } from '@/hooks/useCommunications';
import { AnimatedModal } from './AnimatedModal';
import { CommunicationDocument } from './CommunicationDocument';
import { formatDateTime } from './communicationFormat';

interface Props {
  /** Comunicado seleccionado en la lista (se muestra de inmediato). */
  communication: Communication | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAcknowledgment?: (id: string) => void;
  isConfirming?: boolean;
  /** Modo gestor: solo lectura, sin acuse ni registro de lectura visible. */
  readOnly?: boolean;
}

export const CommunicationDetailModal: React.FC<Props> = ({
  communication,
  isOpen,
  onClose,
  onConfirmAcknowledgment,
  isConfirming = false,
  readOnly = false,
}) => {
  // En modo lector se consulta el detalle: registra la lectura y trae el estado real.
  const { data: detail } = useCommunicationDetail(isOpen && !readOnly ? communication?.id ?? null : null);
  const current: Communication | null = communication
    ? { ...communication, ...(detail && detail.id === communication.id ? detail : {}) }
    : null;

  const needsAck = Boolean(
    !readOnly && current?.requiresAcknowledgment && !current.isAcknowledged,
  );

  const ackSlot =
    !readOnly && current?.requiresAcknowledgment ? (
      <AnimatePresence mode="wait" initial={false}>
        {current.isAcknowledged ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200"
          >
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
            </motion.span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Lectura confirmada</p>
              <p className="text-xs text-emerald-700">
                Registrada el {formatDateTime(current.acknowledgedAt)}.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200"
          >
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Confirmación pendiente</p>
              <p className="text-xs text-amber-800">
                La institución solicita confirmar la recepción de este aviso para el registro oficial.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ) : null;

  return (
    <AnimatedModal
      isOpen={isOpen && Boolean(current)}
      onClose={onClose}
      size="lg"
      title={readOnly ? 'Vista del comunicado' : 'Comunicado institucional'}
      subtitle={
        readOnly
          ? 'Así lo verán los destinatarios en su muro de avisos.'
          : 'Canal oficial de avisos del CTP de Hojancha.'
      }
      icon={<Megaphone className="w-5 h-5" />}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {needsAck && current && onConfirmAcknowledgment && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onConfirmAcknowledgment(current.id)}
                disabled={isConfirming}
                className="bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isConfirming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                )}
                {isConfirming ? 'Confirmando…' : 'Confirmar lectura'}
              </motion.button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
    >
      {current && <CommunicationDocument communication={current} footerSlot={ackSlot} />}
    </AnimatedModal>
  );
};

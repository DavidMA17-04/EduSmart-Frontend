import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import './communications.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Contenido del encabezado a la derecha del título (badges, etc.). */
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  /** Impide cerrar con Escape o clic fuera (p. ej. mientras se guarda). */
  locked?: boolean;
  children: React.ReactNode;
}

const SIZE_CLASS: Record<NonNullable<Props['size']>, string> = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
};

/**
 * Modal con entrada/salida animada, cierre con Escape, bloqueo de scroll del
 * fondo y foco inicial en el panel. Se monta en `document.body`.
 */
export const AnimatedModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerExtra,
  footer,
  size = 'lg',
  locked = false,
  children,
}) => {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // `onClose` suele ser una función nueva en cada render del padre (p. ej. el
  // editor al escribir). Se guarda en refs para que el efecto de apertura NO se
  // vuelva a ejecutar en cada tecla: si lo hiciera, re-enfocaría el panel y el
  // campo de texto perdería el foco tras cada carácter.
  const onCloseRef = useRef(onClose);
  const lockedRef = useRef(locked);
  onCloseRef.current = onClose;
  lockedRef.current = locked;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !lockedRef.current) onCloseRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    // Foco inicial solo al abrir, y solo si el foco no está ya dentro del modal.
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (panel && !panel.contains(document.activeElement)) panel.focus();
    }, 30);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="edu-comms fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-900/55 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !locked) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={`relative bg-white border border-slate-200/80 rounded-2xl shadow-2xl w-full ${SIZE_CLASS[size]} overflow-hidden flex flex-col max-h-[92vh] outline-none`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
          >
            {(title || headerExtra) && (
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {icon && (
                    <span className="w-10 h-10 rounded-xl bg-[#0d2346]/[0.07] text-[#0d2346] flex items-center justify-center shrink-0">
                      {icon}
                    </span>
                  )}
                  <div className="min-w-0">
                    {title && (
                      <h2 id={titleId} className="text-lg font-bold text-slate-900 leading-snug">
                        {title}
                      </h2>
                    )}
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{subtitle}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {headerExtra}
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={locked}
                    aria-label="Cerrar"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">{children}</div>

            {footer && (
              <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

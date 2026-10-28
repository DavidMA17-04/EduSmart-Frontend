import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  ShieldAlert,
  Siren,
  Users,
} from 'lucide-react';
import { Communication } from '@/types/communications';
import { CommunicationPriorityBadge } from './CommunicationPriorityBadge';
import {
  PRIORITY_THEME,
  audienceSummary,
  formatDateTime,
  formatRelative,
  initials,
} from './communicationFormat';

interface Props {
  communication: Communication;
  index?: number;
  onConfirmAcknowledgment: (id: string) => void;
  onOpenDetail: (comm: Communication) => void;
  confirmingId?: string | null;
}

const PRIORITY_ICON = {
  URGENT: Siren,
  IMPORTANT: AlertTriangle,
  NORMAL: Info,
} as const;

function excerpt(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/^\s*[-•*]\s+/, '• ').trim())
    .filter(Boolean)
    .join(' ');
}

export const CommunicationCard = React.forwardRef<HTMLElement, Props>(function CommunicationCard(
  { communication, index = 0, onConfirmAcknowledgment, onOpenDetail, confirmingId = null },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const isUnread = !communication.isRead;
  const needsAck = communication.requiresAcknowledgment && !communication.isAcknowledged;
  const isConfirming = confirmingId === communication.id;
  const theme = PRIORITY_THEME[communication.priority] ?? PRIORITY_THEME.NORMAL;
  const Icon = PRIORITY_ICON[communication.priority] ?? Info;
  const dateSource = communication.publishDate || communication.createdAt;

  return (
    <motion.article
      ref={ref}
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.32, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      className={`group relative overflow-hidden bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow ${
        isUnread ? 'border-[#0d2346]/20' : 'border-slate-200/80'
      }`}
    >
      {/* Franja lateral por prioridad */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent}`} aria-hidden="true" />

      <div className="p-5 pl-6 flex gap-4">
        <div
          className={`hidden sm:flex w-11 h-11 rounded-xl items-center justify-center shrink-0 border ${theme.softBg} ${theme.text} ${theme.ring}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Encabezado */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CommunicationPriorityBadge priority={communication.priority} />
              {isUnread && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-70 animate-ping" />
                    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-blue-600" />
                  </span>
                  Nuevo
                </span>
              )}
              {communication.requiresAcknowledgment && !communication.isAcknowledged && (
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-slate-500" />
                  Requiere acuse
                </span>
              )}
            </div>
            <time
              dateTime={dateSource}
              title={formatDateTime(dateSource)}
              className="text-xs text-slate-500 whitespace-nowrap"
            >
              {formatRelative(dateSource)}
            </time>
          </div>

          {/* Título y extracto */}
          <button
            type="button"
            onClick={() => onOpenDetail(communication)}
            className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2346]/30 rounded-md"
          >
            <h3
              className={`text-[17px] leading-snug tracking-tight text-slate-900 group-hover:text-[#0d2346] transition-colors ${
                isUnread ? 'font-bold' : 'font-semibold'
              }`}
              style={{ fontFamily: 'var(--brand-font-serif)' }}
            >
              {communication.title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
              {excerpt(communication.content)}
            </p>
          </button>

          {/* Pie */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 text-xs text-slate-500">
              <span className="w-7 h-7 rounded-full bg-[#0d2346] text-white text-[10px] font-bold flex items-center justify-center shrink-0 ring-2 ring-[#cfac65]/40">
                {initials(communication.authorName)}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-700 truncate">
                  {communication.authorName || 'Personal institucional'}
                </p>
                <p className="flex items-center gap-1 truncate">
                  <Users className="w-3 h-3 shrink-0" />
                  {audienceSummary(communication.recipients)}
                </p>
              </div>
            </div>

            {/* Afirmación a la izquierda del grupo de acciones */}
            <div className="flex items-center gap-2">
              {needsAck ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onConfirmAcknowledgment(communication.id)}
                  disabled={isConfirming}
                  className="bg-[#0d2346] hover:bg-[#133261] text-white font-medium text-sm px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isConfirming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  )}
                  {isConfirming ? 'Confirmando…' : 'Confirmar lectura'}
                </motion.button>
              ) : communication.isAcknowledged ? (
                <motion.span
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lectura confirmada
                </motion.span>
              ) : null}

              <button
                type="button"
                onClick={() => onOpenDetail(communication)}
                className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-3.5 py-2 rounded-lg border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
              >
                Leer comunicado
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export const CommunicationCardSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 pl-6 flex gap-4 overflow-hidden relative">
    <span className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200" />
    <div className="hidden sm:block w-11 h-11 rounded-xl bg-slate-100 animate-pulse" />
    <div className="flex-1 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-24 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
      </div>
      <div className="h-5 w-2/3 rounded bg-slate-200/70 animate-pulse" />
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-slate-100 animate-pulse" />
        <div className="h-3.5 w-5/6 rounded bg-slate-100 animate-pulse" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between">
        <div className="h-7 w-40 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-8 w-32 rounded-lg bg-slate-100 animate-pulse" />
      </div>
    </div>
  </div>
);

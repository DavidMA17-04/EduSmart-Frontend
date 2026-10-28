import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, ShieldCheck, Users } from 'lucide-react';
import { Communication } from '@/types/communications';
import {
  PRIORITY_THEME,
  audienceLabels,
  formatLetterDate,
  formatShortDate,
  parseContent,
  referenceCode,
} from './communicationFormat';

export type CommunicationDocumentData = Pick<
  Communication,
  | 'id'
  | 'title'
  | 'content'
  | 'priority'
  | 'requiresAcknowledgment'
  | 'publishDate'
  | 'createdAt'
  | 'expirationDate'
  | 'authorName'
  | 'recipients'
>;

interface Props {
  communication: CommunicationDocumentData;
  /** `preview` reduce márgenes y desactiva animaciones de entrada. */
  variant?: 'full' | 'preview';
  /** Se muestra al pie, p. ej. el estado de acuse del lector. */
  footerSlot?: React.ReactNode;
}

/**
 * Presentación formal de un comunicado institucional: membrete del CTP,
 * referencia, destinatarios, cuerpo con párrafos/listas y bloque de firma.
 */
export const CommunicationDocument: React.FC<Props> = ({
  communication,
  variant = 'full',
  footerSlot,
}) => {
  const reduceMotion = useReducedMotion();
  const animate = variant === 'full' && !reduceMotion;
  const theme = PRIORITY_THEME[communication.priority] ?? PRIORITY_THEME.NORMAL;
  const blocks = parseContent(communication.content || '');
  const audience = audienceLabels(communication.recipients);
  const dateSource = communication.publishDate || communication.createdAt;
  const isPreview = variant === 'preview';

  const item = (index: number) =>
    animate
      ? {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.08 + index * 0.05, duration: 0.3, ease: 'easeOut' as const },
        }
      : {};

  return (
    <article
      className={`relative bg-white text-slate-800 ${isPreview ? 'rounded-xl border border-slate-200 shadow-sm' : ''}`}
    >
      {/* Franja de prioridad */}
      <div className={`h-1.5 w-full ${theme.accent} ${isPreview ? 'rounded-t-xl' : ''}`} />

      <div className={isPreview ? 'px-5 py-5' : 'px-6 sm:px-10 py-7 sm:py-9'}>
        {/* Membrete */}
        <motion.header {...item(0)} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/brand/ctp-hojancha-logo.jpeg"
              alt="Escudo del CTP de Hojancha"
              className={`${isPreview ? 'w-10 h-10' : 'w-12 h-12'} rounded-full border-2 border-[#cfac65]/70 object-cover bg-white shrink-0`}
            />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b7d2e]">
                Ministerio de Educación Pública
              </p>
              <p
                className={`${isPreview ? 'text-sm' : 'text-base'} font-bold text-[#0d2346] leading-tight`}
                style={{ fontFamily: 'var(--brand-font-serif)' }}
              >
                Colegio Técnico Profesional de Hojancha
              </p>
              <p className="text-[11px] text-slate-500">Ciencia · Cultura · 1972</p>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Referencia</p>
            <p className="text-xs font-mono font-semibold text-slate-700">{referenceCode(communication)}</p>
          </div>
        </motion.header>

        {/* Filete dorado */}
        <div className="mt-4 mb-5 flex items-center gap-2" aria-hidden="true">
          <span className="h-px flex-1 bg-gradient-to-r from-[#cfac65] via-[#cfac65]/60 to-transparent" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[#cfac65]" />
        </div>

        {/* Tipo, prioridad y fecha */}
        <motion.div {...item(1)} className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d2346]">
              Comunicado oficial
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${theme.softBg} ${theme.text} ${theme.ring}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
              {theme.label}
            </span>
          </div>
          <p className="text-xs text-slate-500">{formatLetterDate(dateSource)}</p>
        </motion.div>

        {/* Destinatarios */}
        <motion.div {...item(2)} className="flex items-start gap-2 mb-5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500 uppercase tracking-wide pt-1 shrink-0">
            <Users className="w-3.5 h-3.5" />
            Dirigido a
          </span>
          <div className="flex flex-wrap gap-1.5">
            {audience.map((label) => (
              <span
                key={label}
                className="bg-[#0d2346]/[0.06] text-[#0d2346] border border-[#0d2346]/10 px-2 py-0.5 rounded-md font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Asunto */}
        <motion.h1
          {...item(3)}
          className={`${isPreview ? 'text-lg' : 'text-2xl'} font-bold text-slate-900 leading-snug mb-4 break-words`}
          style={{ fontFamily: 'var(--brand-font-serif)' }}
        >
          {communication.title || 'Título del comunicado'}
        </motion.h1>

        {/* Cuerpo */}
        <div className={`space-y-3.5 ${isPreview ? 'text-[13px]' : 'text-[15px]'} leading-relaxed text-slate-700 break-words`}>
          {blocks.length === 0 ? (
            <p className="text-slate-400 italic">El contenido del comunicado aparecerá aquí.</p>
          ) : (
            blocks.map((block, index) =>
              block.kind === 'paragraph' ? (
                <motion.p key={index} {...item(4 + index)} className="whitespace-pre-line">
                  {block.text}
                </motion.p>
              ) : (
                <motion.ul key={index} {...item(4 + index)} className="space-y-1.5 pl-1">
                  {block.items.map((text, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-[0.6em] w-1.5 h-1.5 rounded-full bg-[#cfac65] shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </motion.ul>
              ),
            )
          )}
        </div>

        {/* Firma */}
        <motion.div {...item(5 + blocks.length)} className={`${isPreview ? 'mt-6' : 'mt-9'} flex flex-col items-start`}>
          <span className="w-44 h-px bg-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-900">
            {communication.authorName || 'Personal institucional'}
          </p>
          <p className="text-xs text-slate-500">CTP de Hojancha · Emitido mediante EduSmart</p>
        </motion.div>

        {/* Pie: vigencia y acuse */}
        {(communication.expirationDate || communication.requiresAcknowledgment || footerSlot) && (
          <div className={`${isPreview ? 'mt-5' : 'mt-8'} pt-4 border-t border-dashed border-slate-200 space-y-3`}>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              {communication.expirationDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                  Vigente hasta el {formatShortDate(communication.expirationDate)}
                </span>
              )}
              {communication.requiresAcknowledgment && (
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0d2346]" />
                  Requiere confirmación de lectura
                </span>
              )}
            </div>
            {footerSlot}
          </div>
        )}
      </div>
    </article>
  );
};

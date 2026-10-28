import {
  Communication,
  CommunicationPriority,
  CommunicationRecipient,
} from '@/types/communications';

const TIME_ZONE = 'America/Costa_Rica';

export function formatShortDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  });
}

/** "Hojancha, 26 de octubre de 2026" para el membrete del comunicado. */
export function formatLetterDate(value?: string | null): string {
  const date = value ? new Date(value) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return `Hojancha, ${safe.toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  })}`;
}

const relativeFormatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/** "hace 5 minutos", "ayer", "hace 3 días"; a partir de 7 días usa fecha corta. */
export function formatRelative(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 45) return 'hace un momento';
  if (abs < 3600) return relativeFormatter.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86_400) return relativeFormatter.format(Math.round(diffSeconds / 3600), 'hour');
  if (abs < 7 * 86_400) return relativeFormatter.format(Math.round(diffSeconds / 86_400), 'day');
  return formatShortDate(value);
}

/** Código de referencia estable a partir del id y el año: CTP-COM-2026-5F07. */
export function referenceCode(communication: Pick<Communication, 'id' | 'publishDate' | 'createdAt'>): string {
  const year = new Date(communication.publishDate || communication.createdAt || Date.now()).getFullYear();
  const suffix = (communication.id || '0000').replace(/-/g, '').slice(0, 4).toUpperCase();
  return `CTP-COM-${year}-${suffix}`;
}

export function initials(name?: string | null): string {
  if (!name) return 'CT';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'CT';
}

export function audienceLabels(recipients?: CommunicationRecipient[]): string[] {
  if (!recipients || recipients.length === 0) return ['Toda la institución'];
  if (recipients.some((r) => r.recipientType === 'ALL')) return ['Toda la institución'];
  return recipients.map((r) => r.label || r.targetId || 'Destinatario');
}

export function audienceSummary(recipients?: CommunicationRecipient[]): string {
  const labels = audienceLabels(recipients);
  if (labels.length <= 2) return labels.join(' y ');
  return `${labels.slice(0, 2).join(', ')} y ${labels.length - 2} más`;
}

export type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

/**
 * Convierte el texto plano del comunicado en bloques: párrafos separados por
 * línea en blanco y listas para líneas que inicien con "-", "•" o "*".
 */
export function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const chunks = content.replace(/\r\n/g, '\n').split(/\n{2,}/);

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim() !== '');
    if (lines.length === 0) continue;

    let paragraph: string[] = [];
    let list: string[] = [];
    const flushParagraph = () => {
      if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join('\n') });
      paragraph = [];
    };
    const flushList = () => {
      if (list.length) blocks.push({ kind: 'list', items: list });
      list = [];
    };

    for (const line of lines) {
      const match = line.trim().match(/^[-•*]\s+(.*)$/);
      if (match) {
        flushParagraph();
        list.push(match[1]);
      } else {
        flushList();
        paragraph.push(line.trim());
      }
    }
    flushParagraph();
    flushList();
  }

  return blocks;
}

export interface PriorityTheme {
  label: string;
  accent: string;
  softBg: string;
  text: string;
  ring: string;
  dot: string;
}

export const PRIORITY_THEME: Record<CommunicationPriority, PriorityTheme> = {
  URGENT: {
    label: 'Urgente',
    accent: 'bg-rose-500',
    softBg: 'bg-rose-50',
    text: 'text-rose-700',
    ring: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  IMPORTANT: {
    label: 'Importante',
    accent: 'bg-amber-500',
    softBg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  NORMAL: {
    label: 'Informativo',
    accent: 'bg-[#0d2346]',
    softBg: 'bg-slate-50',
    text: 'text-slate-700',
    ring: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

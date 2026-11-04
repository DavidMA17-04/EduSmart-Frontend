import type { InboxItem, InboxSource } from './types';

export const EMPTY_INBOX_MESSAGE = 'No hay notificaciones pendientes';

export const INBOX_SOURCE_LABEL: Record<InboxSource, string> = {
  disciplinary: 'Disciplina',
  absenteeism: 'Ausentismo',
  justification_pending: 'Justificación',
};

export function badgeLabel(unreadCount: number): string | null {
  if (unreadCount <= 0) return null;
  if (unreadCount > 9) return '9+';
  return String(unreadCount);
}

export function canMarkRead(source: InboxSource): boolean {
  return source === 'disciplinary' || source === 'absenteeism';
}

export function togglePanel(open: boolean): boolean {
  return !open;
}

export function inboxBelongsToActor(
  items: readonly InboxItem[],
  allowedIds: ReadonlySet<string>,
): boolean {
  return items.every((item) => allowedIds.has(`${item.source}:${item.id}`));
}

export function formatInboxTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(iso));
}

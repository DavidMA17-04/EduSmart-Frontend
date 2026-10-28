import { describe, expect, it } from 'vitest';
import {
  EMPTY_INBOX_MESSAGE,
  badgeLabel,
  canMarkRead,
  formatInboxTime,
  inboxBelongsToActor,
  togglePanel,
} from './inboxPanel';
import type { InboxItem } from './types';

describe('campana de notificaciones', () => {
  it('muestra el distintivo 3 y lo oculta en 0', () => {
    expect(badgeLabel(3)).toBe('3');
    expect(badgeLabel(0)).toBeNull();
  });

  it('satura el distintivo en 9+', () => {
    expect(badgeLabel(9)).toBe('9');
    expect(badgeLabel(10)).toBe('9+');
  });

  it('abre y cierra el panel', () => {
    expect(togglePanel(false)).toBe(true);
    expect(togglePanel(true)).toBe(false);
  });

  it('usa el mensaje vacío exacto', () => {
    expect(EMPTY_INBOX_MESSAGE).toBe('No hay notificaciones pendientes');
  });

  it('acusa disciplina y ausentismo, no justificaciones pendientes', () => {
    expect(canMarkRead('disciplinary')).toBe(true);
    expect(canMarkRead('absenteeism')).toBe(true);
    expect(canMarkRead('justification_pending')).toBe(false);
  });

  it('no mezcla ítems de otro usuario', () => {
    const mine: InboxItem[] = [
      item({ id: 1, source: 'disciplinary' }),
      item({ id: 9, source: 'absenteeism' }),
    ];
    const allowed = new Set(['disciplinary:1', 'absenteeism:9']);
    expect(inboxBelongsToActor(mine, allowed)).toBe(true);
    expect(
      inboxBelongsToActor(
        [...mine, item({ id: 2, source: 'disciplinary', title: 'Ajeno' })],
        allowed,
      ),
    ).toBe(false);
  });

  it('formatea la antigüedad en español', () => {
    const now = Date.parse('2026-10-26T12:00:00.000Z');
    expect(formatInboxTime('2026-10-26T11:50:00.000Z', now)).toBe('Hace 10 min');
    expect(formatInboxTime('2026-10-26T10:00:00.000Z', now)).toBe('Hace 2 h');
  });
});

function item(partial: Partial<InboxItem> & Pick<InboxItem, 'id' | 'source'>): InboxItem {
  return {
    title: 'Aviso',
    body: 'Detalle',
    href: '/admin/discipline/notifications',
    createdAt: '2026-10-21T10:00:00.000Z',
    readAt: null,
    ...partial,
  };
}

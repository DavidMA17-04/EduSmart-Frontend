import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X } from 'lucide-react';
import { notifyDisciplineInboxChanged } from '@/features/manage-discipline/model/guardianInbox';
import { inboxApi } from '../api/inboxApi';
import {
  EMPTY_INBOX_MESSAGE,
  INBOX_SOURCE_LABEL,
  badgeLabel,
  canMarkRead,
  formatInboxTime,
  hasMarkableItems,
  togglePanel,
} from '../model/inboxPanel';
import { useInbox } from '../model/useInbox';
import { useRealtimeInbox } from '../model/useRealtimeInbox';
import type { InboxItem } from '../model/types';
import styles from './NotificationBell.module.css';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { inbox, error, loading, reload } = useInbox();
  useRealtimeInbox(reload);
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const badge = badgeLabel(inbox?.unreadCount ?? 0);
  const items = inbox?.items ?? [];
  const canMarkAll = hasMarkableItems(items);

  useEffect(() => {
    if (!open) return undefined;
    void reload();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointer = (event: MouseEvent | PointerEvent) => {
      const root = wrapRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, reload]);

  const onSelect = (item: InboxItem) => {
    setOpen(false);
    navigate(item.href);
    if (!canMarkRead(item.source)) return;
    void inboxApi.markRead(item.source, item.id).then(() => {
      notifyDisciplineInboxChanged();
      return reload();
    });
  };

  const onMarkAll = () => {
    if (!canMarkAll || markingAll) return;
    setMarkingAll(true);
    void inboxApi
      .markAllRead()
      .then(() => {
        notifyDisciplineInboxChanged();
        return reload();
      })
      .finally(() => setMarkingAll(false));
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Notificaciones"
        className={styles.trigger}
        onClick={() => setOpen((current) => togglePanel(current))}
        type="button"
      >
        <Bell size={20} />
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </button>
      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Notificaciones">
          <div className={styles.panelHead}>
            <div>
              <p className={styles.heading}>Notificaciones</p>
              <p className={styles.headingSub}>
                {loading && !inbox
                  ? 'Actualizando…'
                  : `${inbox?.unreadCount ?? 0} pendiente${(inbox?.unreadCount ?? 0) === 1 ? '' : 's'}`}
              </p>
            </div>
            <div className={styles.headActions}>
              {canMarkAll ? (
                <button
                  className={styles.markAll}
                  disabled={markingAll}
                  onClick={onMarkAll}
                  type="button"
                >
                  <CheckCheck aria-hidden size={14} />
                  {markingAll ? 'Marcando…' : 'Marcar todas'}
                </button>
              ) : null}
              <button
                aria-label="Cerrar notificaciones"
                className={styles.close}
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {loading && !inbox ? <p className={styles.status}>Cargando notificaciones…</p> : null}
          {error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button className={styles.retry} onClick={() => void reload()} type="button">
                Reintentar
              </button>
            </div>
          ) : null}
          {!error && !loading && items.length === 0 ? (
            <p className={styles.empty}>{EMPTY_INBOX_MESSAGE}</p>
          ) : null}
          {items.length > 0 && !error ? (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={`${item.source}-${item.id}`}>
                  <button className={styles.item} onClick={() => onSelect(item)} type="button">
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemBody}>{item.body}</span>
                    <span className={styles.itemMeta}>
                      {INBOX_SOURCE_LABEL[item.source]} · {formatInboxTime(item.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

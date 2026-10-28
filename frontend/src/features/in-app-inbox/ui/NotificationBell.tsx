import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notifyDisciplineInboxChanged } from '@/features/manage-discipline/model/guardianInbox';
import { inboxApi } from '../api/inboxApi';
import {
  EMPTY_INBOX_MESSAGE,
  INBOX_SOURCE_LABEL,
  badgeLabel,
  canMarkRead,
  formatInboxTime,
  togglePanel,
} from '../model/inboxPanel';
import { useInbox } from '../model/useInbox';
import type { InboxItem } from '../model/types';
import styles from './NotificationBell.module.css';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { inbox, error, loading, reload } = useInbox();
  const [open, setOpen] = useState(false);
  const badge = badgeLabel(inbox?.unreadCount ?? 0);
  const items = inbox?.items ?? [];

  useEffect(() => {
    if (!open) return undefined;
    void reload();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  return (
    <div className={styles.wrap}>
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
          <p className={styles.heading}>Notificaciones</p>
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

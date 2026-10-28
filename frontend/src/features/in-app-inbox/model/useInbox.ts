import { useCallback, useEffect, useState } from 'react';
import { DISCIPLINE_NOTIFICATIONS_CHANGED } from '@/features/manage-discipline/model/guardianInbox';
import { inboxApi } from '../api/inboxApi';
import type { InboxMine } from './types';

export function useInbox() {
  const [inbox, setInbox] = useState<InboxMine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    return inboxApi
      .mine()
      .then((data) => {
        setInbox(data);
        setError(null);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las notificaciones.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener(DISCIPLINE_NOTIFICATIONS_CHANGED, load);
    return () => {
      window.removeEventListener(DISCIPLINE_NOTIFICATIONS_CHANGED, load);
    };
  }, [load]);

  return { inbox, error, loading, reload: load };
}

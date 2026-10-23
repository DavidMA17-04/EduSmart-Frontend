import { useEffect, useState } from 'react';
import { disciplineApi } from '../api/disciplineApi';
import { DISCIPLINE_NOTIFICATIONS_CHANGED } from '../model/guardianInbox';

export function useGuardianUnreadCount(enabled: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const load = () => {
      void disciplineApi
        .listMyNotifications()
        .then((inbox) => {
          if (active) setCount(inbox.unreadCount);
        })
        .catch(() => {
          if (active) setCount(0);
        });
    };
    load();
    window.addEventListener(DISCIPLINE_NOTIFICATIONS_CHANGED, load);
    return () => {
      active = false;
      window.removeEventListener(DISCIPLINE_NOTIFICATIONS_CHANGED, load);
    };
  }, [enabled]);

  return count;
}

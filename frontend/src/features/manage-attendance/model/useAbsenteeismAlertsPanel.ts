import { useCallback, useEffect, useState } from 'react';
import type { AbsenteeismDashboard } from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import { attendanceApi } from '../api/attendanceApi';

export function useAbsenteeismAlertsPanel() {
  const [dashboard, setDashboard] = useState<AbsenteeismDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await attendanceApi.getAbsenteeismDashboard();
      setDashboard(data);
      setError(null);
    } catch (err) {
      setDashboard(null);
      setError(
        err instanceof HttpError
          ? err.message
          : 'No se pudieron cargar las alertas de ausentismo.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (notificationId: number) => {
    try {
      await attendanceApi.markAbsenteeismNotificationRead(notificationId);
      await load();
    } catch (err) {
      setError(
        err instanceof HttpError
          ? err.message
          : 'No se pudo marcar la notificación como leída.',
      );
    }
  };

  return {
    dashboard,
    isLoading,
    error,
    reload: load,
    markRead,
  };
}

import { useCallback, useEffect, useState } from 'react';
import type {
  AbsenteeismAlertRule,
  AbsenteeismDashboard,
  AbsenteeismPersistedAlert,
} from '@/entities/attendance';
import { HttpError } from '@/shared/api';
import { sessionHasPermission } from '@/shared/auth';
import { attendanceApi } from '../api/attendanceApi';
import { ATTENDANCE_PERMISSIONS } from './attendanceRouting';

export function useAbsenteeismAlertsPanel() {
  const [dashboard, setDashboard] = useState<AbsenteeismDashboard | null>(null);
  const [rules, setRules] = useState<AbsenteeismAlertRule[]>([]);
  const [alerts, setAlerts] = useState<AbsenteeismPersistedAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEditRules = sessionHasPermission(ATTENDANCE_PERMISSIONS.edit);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dash, rulesData, alertsData] = await Promise.all([
        attendanceApi.getAbsenteeismDashboard(),
        attendanceApi.listAbsenteeismRules(),
        attendanceApi.listAbsenteeismAlerts(),
      ]);
      setDashboard(dash);
      setRules(rulesData);
      setAlerts(alertsData);
      setError(null);
    } catch (err) {
      setDashboard(null);
      setRules([]);
      setAlerts([]);
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

  const updateRule = async (
    id: number,
    input: { thresholdValue?: number; isActive?: boolean },
  ) => {
    if (!canEditRules) {
      setError('Sin permiso para editar reglas de ausentismo.');
      return;
    }
    setIsSavingRule(true);
    try {
      const updated = await attendanceApi.updateAbsenteeismRule(id, input);
      setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setError(null);
      await load();
    } catch (err) {
      setError(
        err instanceof HttpError
          ? err.message
          : 'No se pudo actualizar la regla de ausentismo.',
      );
    } finally {
      setIsSavingRule(false);
    }
  };

  return {
    dashboard,
    rules,
    alerts,
    isLoading,
    isSavingRule,
    error,
    canEditRules,
    reload: load,
    markRead,
    updateRule,
  };
}

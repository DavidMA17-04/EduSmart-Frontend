import { useCallback, useEffect, useState } from 'react';
import type { AttendanceDashboardKpis } from '@/entities/attendance';
import { attendanceApi } from '../api/attendanceApi';
import { flowErrorMessage } from './createAttendanceSessionFlow';

const emptyKpis = (): AttendanceDashboardKpis => ({
  scope: 'teacher',
  asOfDate: '',
  criticalAbsenceRate: 20,
  today: {
    attendanceRate: 0,
    expectedStudents: 0,
    registeredStudents: 0,
    present: 0,
    absent: 0,
    late: 0,
    justified: 0,
  },
  kpis: {
    todayRate: 0,
    presentCount: 0,
    criticalAbsences: 0,
    openSessions: 0,
  },
  trend: [],
  distribution: {
    present: 0,
    absent: 0,
    late: 0,
    justified: 0,
    total: 0,
    attendanceRate: 0,
  },
  groupRates: [],
  alerts: [],
});

export function useAttendanceDashboardKpis() {
  const [data, setData] = useState<AttendanceDashboardKpis>(emptyKpis);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await attendanceApi.getAttendanceDashboardKpis();
      setData(next);
    } catch (reason) {
      setError(
        flowErrorMessage(reason, 'No se pudieron cargar los indicadores de asistencia.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AttendanceAnalyticsFilters,
  AttendanceAnalyticsSummary,
  AttendanceGroup,
  AttendanceStatus,
} from '@/entities/attendance';
import type { AcademicPeriod } from '@/entities/academic-period';
import type { Subject } from '@/entities/subject';
import { academicPeriodApi } from '@/features/manage-academic-period';
import { subjectApi } from '@/features/manage-subject';
import { attendanceApi } from '../api/attendanceApi';
import { flowErrorMessage } from './createAttendanceSessionFlow';

const emptySummary = (): AttendanceAnalyticsSummary => ({
  scope: 'teacher',
  startDate: null,
  endDate: null,
  totalSessions: 0,
  averageAttendanceRate: 0,
  totalJustifications: 0,
  counts: {
    present: 0,
    absent: 0,
    late: 0,
    justified: 0,
    total: 0,
    attendanceRate: 0,
  },
  byGroup: [],
  trend: [],
});

function optionalId(raw: string): number | undefined {
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

export function useAttendanceReportsPanel() {
  const [groups, setGroups] = useState<AttendanceGroup[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [academicPeriodId, setAcademicPeriodId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<AttendanceStatus | ''>('');

  const [summary, setSummary] = useState<AttendanceAnalyticsSummary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const filters = useMemo<AttendanceAnalyticsFilters>(
    () => ({
      academicPeriodId: optionalId(academicPeriodId),
      groupId: optionalId(groupId),
      courseId: optionalId(courseId),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status || undefined,
    }),
    [academicPeriodId, courseId, endDate, groupId, startDate, status],
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      const errors: string[] = [];
      try {
        const nextGroups = await attendanceApi.listAttendanceGroups();
        if (active) setGroups(nextGroups);
      } catch (reason) {
        errors.push(flowErrorMessage(reason, 'No se pudieron cargar los grupos.'));
      }
      try {
        const nextPeriods = await academicPeriodApi.list();
        if (active) setPeriods(nextPeriods);
      } catch {
        /* período es opcional para docentes sin periods.view */
      }
      try {
        const nextSubjects = await subjectApi.list();
        if (active) {
          setSubjects(nextSubjects.filter((row) => row.status === 'ACTIVE'));
        }
      } catch {
        /* asignatura es opcional si no hay academic_structure.view */
      }
      if (active) {
        setCatalogError(errors[0] ?? null);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await attendanceApi.getAttendanceAnalyticsSummary(filters);
      setSummary(next);
    } catch (reason) {
      setError(
        flowErrorMessage(reason, 'No se pudieron calcular los indicadores.'),
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const exportReport = useCallback(
    async (format: 'pdf' | 'excel') => {
      setExporting(format);
      setError(null);
      try {
        await attendanceApi.exportAttendanceReport(format, filters);
      } catch (reason) {
        setError(
          flowErrorMessage(reason, 'No se pudo descargar el reporte.'),
        );
      } finally {
        setExporting(null);
      }
    },
    [filters],
  );

  return {
    groups,
    periods,
    subjects,
    catalogError,
    academicPeriodId,
    setAcademicPeriodId,
    groupId,
    setGroupId,
    courseId,
    setCourseId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    status,
    setStatus,
    summary,
    loading,
    error,
    exporting,
    loadSummary,
    exportReport,
  };
}

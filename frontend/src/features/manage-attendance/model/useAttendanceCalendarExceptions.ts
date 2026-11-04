import { useCallback, useEffect, useState } from 'react';
import type {
  AttendanceCalendarException,
  AttendanceCalendarExceptionType,
  CreateAttendanceCalendarExceptionInput,
} from '@/entities/attendance';
import type { AcademicPeriod } from '@/entities/academic-period';
import { academicPeriodApi } from '@/features/manage-academic-period/api/academicPeriodApi';
import { HttpError } from '@/shared/api';
import { attendanceApi } from '../api/attendanceApi';

export type ExceptionFormState = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  exceptionType: AttendanceCalendarExceptionType;
};

const emptyForm = (): ExceptionFormState => ({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  exceptionType: 'SUSPENDED',
});

function errorMessage(reason: unknown, fallback: string): string {
  if (reason instanceof HttpError && reason.message) return reason.message;
  if (reason instanceof Error && reason.message) return reason.message;
  return fallback;
}

export function useAttendanceCalendarExceptions() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [rows, setRows] = useState<AttendanceCalendarException[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceCalendarException | null>(
    null,
  );
  const [form, setForm] = useState<ExceptionFormState>(emptyForm);

  const loadPeriods = useCallback(async () => {
    try {
      const list = await academicPeriodApi.list();
      setPeriods(list);
      if (list.length > 0) {
        const active =
          list.find((p) => p.status === 'ACTIVE') ?? list[0];
        setPeriodId(Number(active.id));
      }
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudieron cargar los períodos.'));
    }
  }, []);

  const loadRows = useCallback(async (academicPeriodId: number) => {
    setLoading(true);
    setError(null);
    try {
      setRows(
        await attendanceApi.listCalendarExceptions({ academicPeriodId }),
      );
    } catch (reason) {
      setRows([]);
      setError(
        errorMessage(reason, 'No se pudieron cargar las excepciones.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPeriods();
  }, [loadPeriods]);

  useEffect(() => {
    if (periodId == null) {
      setRows([]);
      setLoading(false);
      return;
    }
    void loadRows(periodId);
  }, [periodId, loadRows]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (row: AttendanceCalendarException) => {
    setEditing(row);
    setForm({
      title: row.title,
      description: row.description ?? '',
      startDate: row.startDate,
      endDate: row.endDate,
      exceptionType: row.exceptionType,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const submit = async (): Promise<{ ok: boolean; message: string }> => {
    if (periodId == null) {
      return { ok: false, message: 'Selecciona un curso lectivo.' };
    }
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      return { ok: false, message: 'Completa título y rango de fechas.' };
    }

    setSaving(true);
    try {
      const payload: CreateAttendanceCalendarExceptionInput = {
        academicPeriodId: periodId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        startDate: form.startDate,
        endDate: form.endDate,
        exceptionType: form.exceptionType,
      };
      if (editing) {
        await attendanceApi.updateCalendarException(editing.id, {
          title: payload.title,
          description: payload.description,
          startDate: payload.startDate,
          endDate: payload.endDate,
          exceptionType: payload.exceptionType,
        });
      } else {
        await attendanceApi.createCalendarException(payload);
      }
      await loadRows(periodId);
      setModalOpen(false);
      setEditing(null);
      return {
        ok: true,
        message: editing ? 'Excepción actualizada.' : 'Excepción creada.',
      };
    } catch (reason) {
      return {
        ok: false,
        message: errorMessage(reason, 'No se pudo guardar la excepción.'),
      };
    } finally {
      setSaving(false);
    }
  };

  const remove = async (
    row: AttendanceCalendarException,
  ): Promise<{ ok: boolean; message: string }> => {
    if (periodId == null) {
      return { ok: false, message: 'Selecciona un curso lectivo.' };
    }
    setSaving(true);
    try {
      await attendanceApi.deleteCalendarException(row.id);
      await loadRows(periodId);
      return { ok: true, message: 'Excepción eliminada.' };
    } catch (reason) {
      return {
        ok: false,
        message: errorMessage(reason, 'No se pudo eliminar la excepción.'),
      };
    } finally {
      setSaving(false);
    }
  };

  return {
    periods,
    periodId,
    setPeriodId,
    rows,
    loading,
    saving,
    error,
    modalOpen,
    editing,
    form,
    setForm,
    openCreate,
    openEdit,
    closeModal,
    submit,
    remove,
    reload: () => (periodId != null ? loadRows(periodId) : Promise.resolve()),
  };
}

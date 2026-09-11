import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AcademicPeriod } from '@/entities/academic-period';
import type { AcademicGroup, GuideTeacher } from '@/entities/group';
import type {
  ScheduleEntry,
  ScheduleTimeSlot,
} from '@/entities/schedule';
import type { TeachingAssignment } from '@/entities/teaching-assignment';
import { academicPeriodApi } from '@/features/manage-academic-period/api/academicPeriodApi';
import { groupApi } from '@/features/manage-group/api/groupApi';
import { guideTeacherApi } from '@/features/manage-group/api/guideTeacherApi';
import { teachingAssignmentApi } from '@/features/manage-teaching-assignment/api/teachingAssignmentApi';
import { sessionHasPermission } from '@/shared/auth';
import { HttpError } from '@/shared/api/httpClient';
import { useToast } from '@/shared/ui';
import { scheduleApi } from '../api/scheduleApi';
import { humanizeScheduleMutationError } from './scheduleErrors';
import {
  dayOfWeekLabel,
  formatSlotRange,
  teachingAssignmentOptionLabel,
} from './scheduleLabels';
import {
  buildEntriesListFilters,
  filterTeachingAssignmentsForContext,
  groupEntriesByCell,
  sortTimeSlotsByDisplayOrder,
  visibleSlotsForMatrix,
} from './scheduleMatrix';
import { canEditSchedule, SCHEDULE_PERMISSIONS } from './schedulePermissions';

export type ScheduleDialogMode = 'create' | 'edit';

export type ScheduleEntryFormValues = {
  teachingAssignmentId: string;
  dayOfWeek: string;
  timeSlotId: string;
};

const EMPTY_FORM: ScheduleEntryFormValues = {
  teachingAssignmentId: '',
  dayOfWeek: '',
  timeSlotId: '',
};

function teacherDisplayName(teacher: GuideTeacher): string {
  return teacher.name || teacher.email || `Docente #${teacher.id}`;
}

function pickDefaultPeriodId(periods: AcademicPeriod[]): string {
  const active = periods.find((p) => p.status === 'ACTIVE');
  if (active) return String(active.id);
  return periods[0] ? String(periods[0].id) : '';
}

export function useSchedulePanel() {
  const toast = useToast();
  const canEdit = canEditSchedule(sessionHasPermission);
  const canViewTeachingAssignments = sessionHasPermission(
    'academic_structure.view',
  );

  const [timeSlots, setTimeSlots] = useState<ScheduleTimeSlot[]>([]);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<
    TeachingAssignment[]
  >([]);
  const [teachers, setTeachers] = useState<GuideTeacher[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);

  const [slotsLoading, setSlotsLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [tasLoading, setTasLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [tasError, setTasError] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [filterPeriodId, setFilterPeriodId] = useState('');
  const [filterTeacherId, setFilterTeacherId] = useState('');
  const [filterGroupId, setFilterGroupId] = useState('');
  const [mobileDay, setMobileDay] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ScheduleDialogMode>('create');
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [form, setForm] = useState<ScheduleEntryFormValues>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const periodIdNum = filterPeriodId ? Number(filterPeriodId) : null;
  const teacherIdNum = filterTeacherId ? Number(filterTeacherId) : null;
  const groupIdNum = filterGroupId ? Number(filterGroupId) : null;

  const sortedSlots = useMemo(
    () => sortTimeSlotsByDisplayOrder(timeSlots),
    [timeSlots],
  );

  const matrixSlots = useMemo(
    () => visibleSlotsForMatrix(timeSlots, entries),
    [timeSlots, entries],
  );

  const entriesByCell = useMemo(() => groupEntriesByCell(entries), [entries]);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const [teacherList, groupList, periodList] = await Promise.all([
        guideTeacherApi.list(),
        groupApi.list(),
        academicPeriodApi.list(),
      ]);
      setTeachers(teacherList);
      setGroups(groupList);
      setPeriods(periodList);
      setFilterPeriodId((prev) =>
        prev ? prev : pickDefaultPeriodId(periodList),
      );
    } catch (err) {
      setCatalogError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los catálogos.',
      );
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const loadTimeSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const slots = await scheduleApi.listTimeSlots();
      setTimeSlots(slots);
    } catch (err) {
      setSlotsError(
        err instanceof HttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudieron cargar los bloques horarios.',
      );
      // Keep previous slots on refresh failure; clear only on first load if empty handled by UI
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    setEntriesError(null);
    try {
      const filters = buildEntriesListFilters({
        periodId: periodIdNum,
        teacherId: teacherIdNum,
        groupId: groupIdNum,
      });
      const data = await scheduleApi.listEntries(filters);
      setEntries(data);
    } catch (err) {
      setEntriesError(
        err instanceof HttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudieron cargar las clases del horario.',
      );
      // Do not convert errors into empty arrays
    } finally {
      setEntriesLoading(false);
    }
  }, [periodIdNum, teacherIdNum, groupIdNum]);

  const loadTeachingAssignments = useCallback(async () => {
    if (periodIdNum == null) {
      setTeachingAssignments([]);
      setTasError(null);
      return;
    }
    setTasLoading(true);
    setTasError(null);
    try {
      const filters = buildEntriesListFilters({
        periodId: periodIdNum,
        teacherId: teacherIdNum,
        groupId: groupIdNum,
      });
      const data = await teachingAssignmentApi.list(filters);
      setTeachingAssignments(data);
    } catch (err) {
      setTasError(
        err instanceof HttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudieron cargar las asignaciones académicas.',
      );
    } finally {
      setTasLoading(false);
    }
  }, [periodIdNum, teacherIdNum, groupIdNum]);

  useEffect(() => {
    void loadCatalog();
    void loadTimeSlots();
  }, [loadCatalog, loadTimeSlots]);

  useEffect(() => {
    if (catalogLoading) return;
    void loadEntries();
  }, [catalogLoading, loadEntries]);

  useEffect(() => {
    if (catalogLoading) return;
    void loadTeachingAssignments();
  }, [catalogLoading, loadTeachingAssignments]);

  const assignableSlots = useMemo(
    () => sortedSlots.filter((s) => s.slotType === 'CLASS' && s.isActive),
    [sortedSlots],
  );

  const taOptions = useMemo(
    () =>
      filterTeachingAssignmentsForContext(teachingAssignments, {
        periodId: periodIdNum,
        teacherId: teacherIdNum,
        groupId: groupIdNum,
      }),
    [teachingAssignments, periodIdNum, teacherIdNum, groupIdNum],
  );

  const patchForm = useCallback((patch: Partial<ScheduleEntryFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setMutationError(null);
  }, []);

  const openAssign = useCallback(
    (dayOfWeek: number, timeSlotId: number) => {
      if (!canEdit) return;
      setDialogMode('create');
      setEditingEntryId(null);
      setForm({
        teachingAssignmentId: '',
        dayOfWeek: String(dayOfWeek),
        timeSlotId: String(timeSlotId),
      });
      setMutationError(null);
      setDialogOpen(true);
    },
    [canEdit],
  );

  const openEdit = useCallback(
    (entry: ScheduleEntry) => {
      if (!canEdit) return;
      setDialogMode('edit');
      setEditingEntryId(entry.entryId);
      setForm({
        teachingAssignmentId: String(entry.teachingAssignment.id),
        dayOfWeek: String(entry.dayOfWeek),
        timeSlotId: String(entry.timeSlot.id),
      });
      setMutationError(null);
      setDialogOpen(true);
    },
    [canEdit],
  );

  const closeDialog = useCallback(() => {
    if (isSaving) return;
    setDialogOpen(false);
    setEditingEntryId(null);
    setMutationError(null);
  }, [isSaving]);

  const submit = useCallback(async () => {
    if (isSaving) return;
    const teachingAssignmentId = Number(form.teachingAssignmentId);
    const dayOfWeek = Number(form.dayOfWeek);
    const timeSlotId = Number(form.timeSlotId);
    if (
      !Number.isInteger(teachingAssignmentId) ||
      teachingAssignmentId <= 0 ||
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < 1 ||
      dayOfWeek > 5 ||
      !Number.isInteger(timeSlotId) ||
      timeSlotId <= 0
    ) {
      setMutationError('Complete la asignación, el día y el bloque horario.');
      return;
    }

    setIsSaving(true);
    setMutationError(null);
    try {
      if (dialogMode === 'create') {
        await scheduleApi.createEntry({
          teachingAssignmentId,
          dayOfWeek,
          timeSlotId,
        });
        toast.push('Clase asignada al horario.', 'success');
      } else if (editingEntryId != null) {
        await scheduleApi.updateEntry(editingEntryId, {
          teachingAssignmentId,
          dayOfWeek,
          timeSlotId,
        });
        toast.push('Clase del horario actualizada.', 'success');
      }
      setDialogOpen(false);
      setEditingEntryId(null);
      await loadEntries();
    } catch (err) {
      setMutationError(humanizeScheduleMutationError(err));
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    form,
    dialogMode,
    editingEntryId,
    loadEntries,
    toast,
  ]);

  const requestDelete = useCallback(
    (entryId: number) => {
      if (!canEdit) return;
      setPendingDeleteId(entryId);
      setConfirmOpen(true);
    },
    [canEdit],
  );

  const cancelDelete = useCallback(() => {
    if (isDeleting) return;
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (pendingDeleteId == null || isDeleting) return;
    setIsDeleting(true);
    try {
      await scheduleApi.deleteEntry(pendingDeleteId);
      toast.push('Clase quitada del horario.', 'success');
      setConfirmOpen(false);
      setPendingDeleteId(null);
      await loadEntries();
    } catch (err) {
      toast.push(humanizeScheduleMutationError(err), 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDeleteId, isDeleting, loadEntries, toast]);

  const contextDayLabel = form.dayOfWeek
    ? dayOfWeekLabel(Number(form.dayOfWeek))
    : '';
  const contextSlot = sortedSlots.find(
    (s) => String(s.id) === form.timeSlotId,
  );
  const contextSlotLabel = contextSlot
    ? formatSlotRange(contextSlot.startTime, contextSlot.endTime)
    : '';

  return {
    timeSlots: sortedSlots,
    matrixSlots,
    assignableSlots,
    entries,
    entriesByCell,
    teachers,
    groups,
    periods,
    taOptions,
    slotsLoading,
    entriesLoading,
    tasLoading,
    catalogLoading,
    slotsError,
    entriesError,
    tasError,
    catalogError,
    mutationError,
    isSaving,
    isDeleting,
    canEdit,
    canViewTeachingAssignments,
    filterPeriodId,
    setFilterPeriodId,
    filterTeacherId,
    setFilterTeacherId,
    filterGroupId,
    setFilterGroupId,
    mobileDay,
    setMobileDay,
    dialogOpen,
    dialogMode,
    form,
    patchForm,
    openAssign,
    openEdit,
    closeDialog,
    submit,
    confirmOpen,
    requestDelete,
    cancelDelete,
    confirmDelete,
    contextDayLabel,
    contextSlotLabel,
    teacherDisplayName,
    teachingAssignmentOptionLabel,
    permissions: SCHEDULE_PERMISSIONS,
    reloadEntries: loadEntries,
    reloadSlots: loadTimeSlots,
  };
}

export type SchedulePanelModel = ReturnType<typeof useSchedulePanel>;

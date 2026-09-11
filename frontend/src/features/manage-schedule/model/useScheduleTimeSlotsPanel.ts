import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ScheduleTimeSlot } from '@/entities/schedule';
import { HttpError } from '@/shared/api/httpClient';
import { useToast } from '@/shared/ui';
import { scheduleApi } from '../api/scheduleApi';
import { canEditSchedule } from './schedulePermissions';
import { sessionHasPermission } from '@/shared/auth';
import { humanizeTimeSlotMutationError } from './timeSlotErrors';
import {
  buildCreateTimeSlotPayload,
  buildUpdateTimeSlotPayload,
  EMPTY_TIME_SLOT_FORM,
  timeSlotFromRow,
  validateTimeSlotForm,
  type TimeSlotFormValues,
} from './timeSlotFormUtils';
import { sortTimeSlotsByDisplayOrder } from './scheduleMatrix';

export type TimeSlotDialogMode = 'create' | 'edit';

type UseScheduleTimeSlotsPanelOptions = {
  /** Called after successful mutations so C1 can refetch. */
  onSlotsChanged?: () => void | Promise<void>;
  /** When false, skip auto-load (parent may own data). Default true. */
  autoLoad?: boolean;
};

export function useScheduleTimeSlotsPanel(
  options: UseScheduleTimeSlotsPanelOptions = {},
) {
  const { onSlotsChanged, autoLoad = true } = options;
  const toast = useToast();
  const canEdit = canEditSchedule(sessionHasPermission);

  const [rows, setRows] = useState<ScheduleTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<TimeSlotDialogMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TimeSlotFormValues>(EMPTY_TIME_SLOT_FORM);

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [pendingDeactivateId, setPendingDeactivateId] = useState<number | null>(
    null,
  );
  const [activateOpen, setActivateOpen] = useState(false);
  const [pendingActivateId, setPendingActivateId] = useState<number | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isMutatingStatus, setIsMutatingStatus] = useState(false);

  const sortedRows = useMemo(() => sortTimeSlotsByDisplayOrder(rows), [rows]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await scheduleApi.listTimeSlots();
      setRows(data);
    } catch (err) {
      setError(
        err instanceof HttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudo cargar la configuración de bloques horarios.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) void load();
  }, [autoLoad, load]);

  const notifyChanged = useCallback(async () => {
    await load();
    if (onSlotsChanged) await onSlotsChanged();
  }, [load, onSlotsChanged]);

  const patchForm = useCallback((patch: Partial<TimeSlotFormValues>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.slotType && patch.slotType !== 'CLASS') {
        next.lessonNumber = '';
      }
      return next;
    });
    setMutationError(null);
  }, []);

  const openCreate = useCallback(() => {
    if (!canEdit) return;
    setDialogMode('create');
    setEditingId(null);
    setForm(EMPTY_TIME_SLOT_FORM);
    setMutationError(null);
    setDialogOpen(true);
  }, [canEdit]);

  const openEdit = useCallback(
    (row: ScheduleTimeSlot) => {
      if (!canEdit) return;
      setDialogMode('edit');
      setEditingId(row.id);
      setForm(timeSlotFromRow(row));
      setMutationError(null);
      setDialogOpen(true);
    },
    [canEdit],
  );

  const closeDialog = useCallback(() => {
    if (isSaving) return;
    setDialogOpen(false);
    setEditingId(null);
    setMutationError(null);
  }, [isSaving]);

  const submit = useCallback(async () => {
    if (isSaving || !canEdit) return;
    const validation = validateTimeSlotForm(form);
    if (validation) {
      setMutationError(validation);
      return;
    }
    setIsSaving(true);
    setMutationError(null);
    try {
      if (dialogMode === 'create') {
        await scheduleApi.createTimeSlot(buildCreateTimeSlotPayload(form));
        toast.push('Bloque horario creado.', 'success');
      } else if (editingId != null) {
        await scheduleApi.updateTimeSlot(
          editingId,
          buildUpdateTimeSlotPayload(form),
        );
        toast.push('Bloque horario actualizado.', 'success');
      }
      setDialogOpen(false);
      setEditingId(null);
      await notifyChanged();
    } catch (err) {
      setMutationError(humanizeTimeSlotMutationError(err, 'update'));
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, canEdit, form, dialogMode, editingId, notifyChanged, toast]);

  const requestDeactivate = useCallback(
    (id: number) => {
      if (!canEdit) return;
      setPendingDeactivateId(id);
      setDeactivateOpen(true);
    },
    [canEdit],
  );

  const cancelDeactivate = useCallback(() => {
    if (isMutatingStatus) return;
    setDeactivateOpen(false);
    setPendingDeactivateId(null);
  }, [isMutatingStatus]);

  const confirmDeactivate = useCallback(async () => {
    if (pendingDeactivateId == null || isMutatingStatus) return;
    setIsMutatingStatus(true);
    try {
      await scheduleApi.updateTimeSlot(pendingDeactivateId, { isActive: false });
      toast.push('Bloque desactivado.', 'success');
      setDeactivateOpen(false);
      setPendingDeactivateId(null);
      await notifyChanged();
    } catch (err) {
      toast.push(humanizeTimeSlotMutationError(err, 'update'), 'error');
    } finally {
      setIsMutatingStatus(false);
    }
  }, [pendingDeactivateId, isMutatingStatus, notifyChanged, toast]);

  const requestActivate = useCallback(
    (id: number) => {
      if (!canEdit) return;
      setPendingActivateId(id);
      setActivateOpen(true);
    },
    [canEdit],
  );

  const cancelActivate = useCallback(() => {
    if (isMutatingStatus) return;
    setActivateOpen(false);
    setPendingActivateId(null);
  }, [isMutatingStatus]);

  const confirmActivate = useCallback(async () => {
    if (pendingActivateId == null || isMutatingStatus) return;
    setIsMutatingStatus(true);
    try {
      await scheduleApi.updateTimeSlot(pendingActivateId, { isActive: true });
      toast.push('Bloque activado.', 'success');
      setActivateOpen(false);
      setPendingActivateId(null);
      await notifyChanged();
    } catch (err) {
      toast.push(humanizeTimeSlotMutationError(err, 'update'), 'error');
    } finally {
      setIsMutatingStatus(false);
    }
  }, [pendingActivateId, isMutatingStatus, notifyChanged, toast]);

  const requestDelete = useCallback(
    (id: number) => {
      if (!canEdit) return;
      setPendingDeleteId(id);
      setDeleteOpen(true);
    },
    [canEdit],
  );

  const cancelDelete = useCallback(() => {
    if (isMutatingStatus) return;
    setDeleteOpen(false);
    setPendingDeleteId(null);
  }, [isMutatingStatus]);

  const confirmDelete = useCallback(async () => {
    if (pendingDeleteId == null || isMutatingStatus) return;
    setIsMutatingStatus(true);
    try {
      await scheduleApi.deleteTimeSlot(pendingDeleteId);
      toast.push('Bloque horario eliminado.', 'success');
      setDeleteOpen(false);
      setPendingDeleteId(null);
      await notifyChanged();
    } catch (err) {
      toast.push(humanizeTimeSlotMutationError(err, 'delete'), 'error');
    } finally {
      setIsMutatingStatus(false);
    }
  }, [pendingDeleteId, isMutatingStatus, notifyChanged, toast]);

  return {
    rows: sortedRows,
    isLoading,
    error,
    mutationError,
    isSaving,
    isMutatingStatus,
    canEdit,
    dialogOpen,
    dialogMode,
    form,
    patchForm,
    openCreate,
    openEdit,
    closeDialog,
    submit,
    deactivateOpen,
    requestDeactivate,
    cancelDeactivate,
    confirmDeactivate,
    activateOpen,
    requestActivate,
    cancelActivate,
    confirmActivate,
    deleteOpen,
    requestDelete,
    cancelDelete,
    confirmDelete,
    reload: load,
  };
}

export type ScheduleTimeSlotsPanelModel = ReturnType<
  typeof useScheduleTimeSlotsPanel
>;

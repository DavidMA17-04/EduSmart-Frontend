import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ScheduleEntry, ScheduleTimeSlot } from '@/entities/schedule';
import {
  groupEntriesByCell,
  scheduleApi,
  sortTimeSlotsByDisplayOrder,
  visibleSlotsForMatrix,
} from '@/features/manage-schedule';
import { sessionHasPermission } from '@/shared/auth';

type Options = {
  groupId: number | null;
};

export function useGroupSchedulePreview({ groupId }: Options) {
  const canView = sessionHasPermission('schedules.view');
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [slots, setSlots] = useState<ScheduleTimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!groupId || !canView) {
      setEntries([]);
      setSlots([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [slotRows, entryRows] = await Promise.all([
        scheduleApi.listTimeSlots(),
        scheduleApi.listEntries({ groupId }),
      ]);
      setSlots(slotRows);
      setEntries(entryRows);
    } catch (reason) {
      setEntries([]);
      setSlots([]);
      setError(
        reason instanceof Error
          ? reason.message
          : 'No se pudo cargar el horario de la sección.',
      );
    } finally {
      setLoading(false);
    }
  }, [canView, groupId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const matrixSlots = useMemo(
    () => visibleSlotsForMatrix(slots, entries),
    [entries, slots],
  );

  const sortedSlots = useMemo(
    () => sortTimeSlotsByDisplayOrder(matrixSlots),
    [matrixSlots],
  );

  const byCell = useMemo(() => groupEntriesByCell(entries), [entries]);

  return {
    canView,
    groupId,
    entries,
    slots: sortedSlots,
    byCell,
    loading,
    error,
    reload,
    hasEntries: entries.length > 0,
  };
}

export type GroupSchedulePreviewModel = ReturnType<typeof useGroupSchedulePreview>;

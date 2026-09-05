import type { FormEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { AcademicPeriod } from '@/entities/academic-period';
import {
  useAcademicPeriodForm,
  useAcademicPeriods,
  useManageAcademicPeriod,
} from '@/features/manage-academic-period';

type DialogMode = 'create' | 'edit' | null;

export type AcademicPeriodTransitionAction = 'activate' | 'close' | 'reopen';

interface PendingPeriodTransition {
  action: AcademicPeriodTransitionAction;
  period: AcademicPeriod;
}

export function useAcademicPeriodsPanel() {
  const periods = useAcademicPeriods();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingTransition, setPendingTransition] = useState<PendingPeriodTransition | null>(null);
  const transitionLockRef = useRef(false);

  const selectedPeriod = useMemo(
    () => periods.allPeriods.find((period) => period.id === selectedPeriodId),
    [periods.allPeriods, selectedPeriodId],
  );
  const formPeriod = dialogMode === 'edit' ? selectedPeriod : undefined;
  const isReadOnly = dialogMode === 'edit' && selectedPeriod?.status === 'CLOSED';
  const { values, setField, toPayload } = useAcademicPeriodForm(formPeriod);
  const {
    create,
    update,
    activate,
    close,
    reopen,
    error: mutationError,
    isSubmitting,
  } = useManageAcademicPeriod(() => { void periods.reload(true); });

  const selectPeriod = useCallback((id: string) => {
    setSelectedPeriodId(id);
  }, []);

  const openCreateDialog = useCallback(() => {
    setSelectedPeriodId(null);
    setDialogMode('create');
    setFormError(null);
  }, []);

  const openEditDialog = useCallback((id: string) => {
    setSelectedPeriodId(id);
    setDialogMode('edit');
    setFormError(null);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogMode(null);
    setFormError(null);
  }, []);

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isReadOnly) return;

    const payload = toPayload();
    if (!payload.name || !payload.startDate || !payload.endDate) return;
    if (payload.endDate < payload.startDate) {
      setFormError('La fecha de finalización no puede ser anterior a la fecha de inicio.');
      return;
    }

    setFormError(null);
    try {
      if (dialogMode === 'create') {
        const created = await create(payload);
        setSelectedPeriodId(created.id);
        setDialogMode(null);
      } else if (selectedPeriod) {
        await update(selectedPeriod.id, payload);
        setDialogMode(null);
      }
    } catch {
      // El hook de mutaciones publica el error para la interfaz.
    }
  }, [create, dialogMode, isReadOnly, selectedPeriod, toPayload, update]);

  const activatePeriod = useCallback((period: AcademicPeriod) => {
    setPendingTransition({ action: 'activate', period });
  }, []);

  const closePeriod = useCallback((period: AcademicPeriod) => {
    setPendingTransition({ action: 'close', period });
  }, []);

  const reopenPeriod = useCallback((period: AcademicPeriod) => {
    setPendingTransition({ action: 'reopen', period });
  }, []);

  const cancelPeriodTransition = useCallback(() => {
    if (transitionLockRef.current) return;
    setPendingTransition(null);
  }, []);

  const confirmPeriodTransition = useCallback(async () => {
    if (!pendingTransition || transitionLockRef.current) return;

    transitionLockRef.current = true;
    const { action, period } = pendingTransition;
    try {
      if (action === 'activate') await activate(period.id);
      else if (action === 'close') await close(period.id);
      else await reopen(period.id);
      setSelectedPeriodId(period.id);
      setPendingTransition(null);
    } catch {
      setPendingTransition(null);
    } finally {
      transitionLockRef.current = false;
    }
  }, [activate, close, pendingTransition, reopen]);

  return {
    ...periods,
    selectedPeriod,
    selectedPeriodId,
    selectPeriod,
    dialogMode,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    isReadOnly,
    formError,
    periodForm: { values, setField, submit },
    mutationError,
    isSubmitting,
    activatePeriod,
    closePeriod,
    reopenPeriod,
    pendingTransition,
    cancelPeriodTransition,
    confirmPeriodTransition,
  };
}

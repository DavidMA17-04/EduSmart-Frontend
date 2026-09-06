import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Specialty, SpecialtyKind } from '@/entities/specialty';
import { HttpError } from '@/shared/api';
import { useManageSpecialty, useSpecialties, useSpecialtyForm } from '@/features/manage-specialty';

type FormMode = 'create' | 'edit';
type ToastTone = 'success' | 'error';

export interface SpecialtyToast {
  tone: ToastTone;
  message: string;
}

const COPY: Record<
  SpecialtyKind,
  {
    noun: string;
    createTitle: string;
    editTitle: string;
    createCta: string;
    empty: string;
    loading: string;
    alert: string;
    successCreate: string;
    duplicateError: string;
    searchPlaceholder: string;
  }
> = {
  EXPLORATORY_WORKSHOP: {
    noun: 'taller',
    createTitle: 'Añadir taller exploratorio',
    editTitle: 'Detalle del taller',
    createCta: 'Añadir taller',
    empty: 'No se encontraron talleres exploratorios.',
    loading: 'Cargando talleres…',
    alert: 'Los talleres inactivos no estarán disponibles para la asignación en períodos académicos.',
    successCreate: 'Taller agregado.',
    duplicateError: 'Nombre duplicado.',
    searchPlaceholder: 'Buscar taller…',
  },
  TECHNICAL_SPECIALTY: {
    noun: 'especialidad',
    createTitle: 'Añadir especialidad técnica',
    editTitle: 'Detalle de la especialidad',
    createCta: 'Añadir especialidad',
    empty: 'No se encontraron especialidades técnicas.',
    loading: 'Cargando especialidades…',
    alert: 'Las especialidades inactivas no estarán disponibles para la asignación en períodos académicos.',
    successCreate: 'Especialidad agregada.',
    duplicateError: 'Nombre duplicado.',
    searchPlaceholder: 'Buscar especialidad…',
  },
};

export function useSpecialtiesPanel(kind: SpecialtyKind) {
  const specialties = useSpecialties(kind);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('edit');
  const [createOpen, setCreateOpen] = useState(false);
  const [createNotice, setCreateNotice] = useState<SpecialtyToast | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [toast, setToast] = useState<SpecialtyToast | null>(null);
  const selectedSpecialty = useMemo(
    () => specialties.allSpecialties.find((specialty) => specialty.id === selectedSpecialtyId),
    [selectedSpecialtyId, specialties.allSpecialties],
  );
  const formSpecialty = formMode === 'edit' ? selectedSpecialty : undefined;
  const { values, setField, toPayload, reset, nameInputRef } = useSpecialtyForm(
    formSpecialty,
    kind,
    resetToken,
  );
  const { create, update, deactivate, error: mutationError, isSubmitting, clearError } =
    useManageSpecialty(() => {
      void specialties.reload(true);
    });
  const copy = COPY[kind];

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!createNotice || createNotice.tone !== 'success') return;
    const timer = window.setTimeout(() => {
      setCreateOpen(false);
      setCreateNotice(null);
      setFormMode('edit');
      setSelectedSpecialtyId(null);
      reset();
      setResetToken((token) => token + 1);
      clearError();
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [clearError, createNotice, reset]);

  const showToast = useCallback((tone: ToastTone, message: string) => {
    setToast({ tone, message });
  }, []);

  const selectSpecialty = useCallback(
    (id: number) => {
      setCreateOpen(false);
      setCreateNotice(null);
      clearError();
      setSelectedSpecialtyId(id);
      setFormMode('edit');
      setResetToken((token) => token + 1);
    },
    [clearError],
  );

  const openCreateModal = useCallback(() => {
    clearError();
    setCreateNotice(null);
    setSelectedSpecialtyId(null);
    setFormMode('create');
    reset();
    setResetToken((token) => token + 1);
    setCreateOpen(true);
    window.requestAnimationFrame(() => nameInputRef.current?.focus());
  }, [clearError, nameInputRef, reset]);

  const closeCreateModal = useCallback(() => {
    if (isSubmitting || createNotice?.tone === 'success') return;
    setCreateOpen(false);
    setCreateNotice(null);
    clearError();
    setFormMode('edit');
    reset();
    setResetToken((token) => token + 1);
  }, [clearError, createNotice, isSubmitting, reset]);

  const closeEditPanel = useCallback(() => {
    setSelectedSpecialtyId(null);
    setFormMode('edit');
    reset();
    setResetToken((token) => token + 1);
    clearError();
  }, [clearError, reset]);

  const mapCreateError = useCallback(
    (reason: unknown) => {
      if (reason instanceof HttpError && reason.status === 409) {
        return copy.duplicateError;
      }
      if (reason instanceof Error && /already exists|ya existe|duplicate|Conflict/i.test(reason.message)) {
        return copy.duplicateError;
      }
      if (reason instanceof Error && reason.message) return reason.message;
      return `No se pudo agregar el ${copy.noun}.`;
    },
    [copy.duplicateError, copy.noun],
  );

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = toPayload();
      if (!payload.name) return;

      if (createOpen || formMode === 'create') {
        try {
          await create(payload);
          setCreateNotice({ tone: 'success', message: copy.successCreate });
        } catch (reason) {
          setCreateNotice({ tone: 'error', message: mapCreateError(reason) });
        }
        return;
      }

      if (selectedSpecialty) {
        try {
          await update(selectedSpecialty.id, payload);
          showToast('success', 'Cambios guardados.');
        } catch (reason) {
          showToast('error', mapCreateError(reason));
        }
      }
    },
    [
      copy.successCreate,
      create,
      createOpen,
      formMode,
      mapCreateError,
      selectedSpecialty,
      showToast,
      toPayload,
      update,
    ],
  );

  const deactivateSpecialty = useCallback(
    async (specialty: Specialty) => {
      if (!window.confirm(`¿Inactivar ${copy.noun} ${specialty.name}?`)) return;
      try {
        await deactivate(specialty.id);
        specialties.removeSpecialty(specialty.id);
        if (selectedSpecialtyId === specialty.id) {
          closeEditPanel();
        }
        showToast('success', 'Inactivado.');
      } catch (reason) {
        showToast('error', mapCreateError(reason));
      }
    },
    [
      closeEditPanel,
      copy.noun,
      deactivate,
      mapCreateError,
      selectedSpecialtyId,
      showToast,
      specialties,
    ],
  );

  return {
    ...specialties,
    kind,
    copy,
    selectedSpecialty,
    selectedSpecialtyId,
    selectSpecialty,
    createOpen,
    createNotice,
    createLocked: createNotice?.tone === 'success',
    openCreateModal,
    closeCreateModal,
    closeEditPanel,
    formMode,
    specialtyForm: { values, setField, submit, nameInputRef },
    mutationError,
    isSubmitting,
    deactivateSpecialty,
    toast,
    dismissToast: () => setToast(null),
  };
}

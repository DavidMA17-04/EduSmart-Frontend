import type { FormEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Specialty, SpecialtyKind } from '@/entities/specialty';
import { HttpError } from '@/shared/api';
import { useManageSpecialty, useSpecialties, useSpecialtyForm } from '@/features/manage-specialty';
import { useToast } from '@/shared/ui';

type DialogMode = 'create' | 'edit' | null;

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
    editTitle: 'Editar taller',
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
    editTitle: 'Editar especialidad',
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
  const toast = useToast();
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [resetToken, setResetToken] = useState(0);
  const [pendingDeactivate, setPendingDeactivate] = useState<Specialty | null>(null);
  const selectedSpecialty = useMemo(
    () => specialties.allSpecialties.find((specialty) => specialty.id === selectedSpecialtyId),
    [selectedSpecialtyId, specialties.allSpecialties],
  );
  const formSpecialty = dialogMode === 'edit' ? selectedSpecialty : undefined;
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

  const openEditDialog = useCallback(
    (id: number) => {
      clearError();
      setSelectedSpecialtyId(id);
      setDialogMode('edit');
      setResetToken((token) => token + 1);
    },
    [clearError],
  );

  const selectSpecialty = useCallback((id: number) => {
    setSelectedSpecialtyId(id);
  }, []);

  const openCreateModal = useCallback(() => {
    clearError();
    setSelectedSpecialtyId(null);
    reset();
    setResetToken((token) => token + 1);
    setDialogMode('create');
    window.requestAnimationFrame(() => nameInputRef.current?.focus());
  }, [clearError, nameInputRef, reset]);

  const closeDialog = useCallback(() => {
    if (isSubmitting) return;
    setDialogMode(null);
    clearError();
    reset();
    setResetToken((token) => token + 1);
  }, [clearError, isSubmitting, reset]);

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

      if (dialogMode === 'create') {
        try {
          await create(payload);
          setDialogMode(null);
          setSelectedSpecialtyId(null);
          reset();
          setResetToken((token) => token + 1);
          clearError();
          toast.push(copy.successCreate);
        } catch (reason) {
          toast.push(mapCreateError(reason), 'error');
        }
        return;
      }

      if (dialogMode === 'edit' && selectedSpecialty) {
        try {
          await update(selectedSpecialty.id, payload);
          setDialogMode(null);
          toast.push('Cambios guardados.');
        } catch (reason) {
          toast.push(mapCreateError(reason), 'error');
        }
      }
    },
    [
      clearError,
      copy.successCreate,
      create,
      dialogMode,
      mapCreateError,
      reset,
      selectedSpecialty,
      toPayload,
      toast,
      update,
    ],
  );

  const requestDeactivate = useCallback((specialty: Specialty) => {
    setPendingDeactivate(specialty);
  }, []);

  const cancelDeactivate = useCallback(() => {
    setPendingDeactivate(null);
  }, []);

  const confirmDeactivate = useCallback(async () => {
    if (!pendingDeactivate) return;
    const specialty = pendingDeactivate;
    try {
      await deactivate(specialty.id);
      specialties.removeSpecialty(specialty.id);
      if (selectedSpecialtyId === specialty.id) {
        setSelectedSpecialtyId(null);
        setDialogMode(null);
      }
      setPendingDeactivate(null);
      toast.push('Inactivado.');
    } catch (reason) {
      setPendingDeactivate(null);
      toast.push(mapCreateError(reason), 'error');
    }
  }, [
    deactivate,
    mapCreateError,
    pendingDeactivate,
    selectedSpecialtyId,
    specialties,
    toast,
  ]);

  return {
    ...specialties,
    kind,
    copy,
    selectedSpecialty,
    selectedSpecialtyId,
    selectSpecialty,
    openEditDialog,
    dialogMode,
    openCreateModal,
    closeDialog,
    specialtyForm: { values, setField, submit, nameInputRef },
    mutationError,
    isSubmitting,
    requestDeactivate,
    cancelDeactivate,
    confirmDeactivate,
    pendingDeactivate,
  };
}

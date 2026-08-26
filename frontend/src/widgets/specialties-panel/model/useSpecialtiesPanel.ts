import type { FormEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Specialty } from '@/entities/specialty';
import { useManageSpecialty, useSpecialties, useSpecialtyForm } from '@/features/manage-specialty';

type FormMode = 'create' | 'edit';

export function useSpecialtiesPanel() {
  const specialties = useSpecialties();
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const selectedSpecialty = useMemo(() => specialties.allSpecialties.find((specialty) => specialty.id === selectedSpecialtyId), [selectedSpecialtyId, specialties.allSpecialties]);
  const formSpecialty = formMode === 'edit' ? selectedSpecialty : undefined;
  const { values, setField, toPayload } = useSpecialtyForm(formSpecialty);
  const { create, update, deactivate, error: mutationError, isSubmitting } = useManageSpecialty(() => { void specialties.reload(true); });

  const selectSpecialty = useCallback((id: number) => {
    setSelectedSpecialtyId(id);
    setFormMode('edit');
  }, []);

  const createSpecialty = useCallback(() => {
    setSelectedSpecialtyId(null);
    setFormMode('create');
  }, []);

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload();
    if (!payload.name) return;
    try {
      if (formMode === 'create') {
        const created = await create(payload);
        setSelectedSpecialtyId(created.id);
        setFormMode('edit');
      } else if (selectedSpecialty) {
        await update(selectedSpecialty.id, payload);
      }
    } catch {
      // El hook de mutaciones publica el error para la interfaz.
    }
  }, [create, formMode, selectedSpecialty, toPayload, update]);

  const deactivateSpecialty = useCallback(async (specialty: Specialty) => {
    if (!window.confirm(`¿Inactivar la especialidad ${specialty.name}?`)) return;
    try {
      await deactivate(specialty.id);
      specialties.removeSpecialty(specialty.id);
      if (selectedSpecialtyId === specialty.id) {
        setSelectedSpecialtyId(null);
        setFormMode('create');
      }
    } catch {
      // El error se expone desde el hook.
    }
  }, [deactivate, selectedSpecialtyId, specialties]);

  return { ...specialties, selectedSpecialty, selectedSpecialtyId, selectSpecialty, createSpecialty, formMode, specialtyForm: { values, setField, submit }, mutationError, isSubmitting, deactivateSpecialty };
}

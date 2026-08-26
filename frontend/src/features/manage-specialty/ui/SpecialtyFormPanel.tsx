import type { FormEventHandler } from 'react';
import type { SpecialtyStatus } from '@/entities/specialty';
import { FormActions, Input, Select, Textarea } from '@/shared/ui';
import type { SpecialtyFormValues } from '../model/useSpecialtyForm';
import styles from './SpecialtyFormPanel.module.css';

interface SpecialtyFormPanelProps {
  title: string;
  values: SpecialtyFormValues;
  isSubmitting?: boolean;
  onChange: <K extends keyof SpecialtyFormValues>(field: K, value: SpecialtyFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const SpecialtyFormPanel = ({ title, values, isSubmitting = false, onChange, onSubmit, onCancel }: SpecialtyFormPanelProps) => (
  <aside className={styles.panel}>
    <h2>{title}</h2>
    <form onSubmit={onSubmit}>
      <label>Nombre de la especialidad<Input required maxLength={150} onChange={(event) => onChange('name', event.target.value)} value={values.name} /></label>
      <label>Descripción<Textarea maxLength={2000} onChange={(event) => onChange('description', event.target.value)} value={values.description} /></label>
      <label>Estado<Select onChange={(event) => onChange('status', event.target.value as SpecialtyStatus)} value={values.status}><option value="ACTIVE">Activa</option><option value="INACTIVE">Inactiva</option></Select></label>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel="Guardar cambios" />
    </form>
  </aside>
);

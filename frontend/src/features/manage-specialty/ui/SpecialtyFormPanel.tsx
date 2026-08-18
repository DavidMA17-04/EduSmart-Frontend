import type { FormEventHandler } from 'react';
import type { SpecialtyStatus } from '@/entities/specialty';
import { Button, Input, Select, Textarea } from '@/shared/ui';
import type { SpecialtyFormValues } from '../model/useSpecialtyForm';
import styles from './SpecialtyFormPanel.module.css';

interface SpecialtyFormPanelProps {
  title: string;
  values: SpecialtyFormValues;
  areaOptions: string[];
  isSubmitting?: boolean;
  onChange: <K extends keyof SpecialtyFormValues>(field: K, value: SpecialtyFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const SpecialtyFormPanel = ({ title, values, areaOptions, isSubmitting = false, onChange, onSubmit, onCancel }: SpecialtyFormPanelProps) => (
  <aside className={styles.panel}>
    <h2>{title}</h2>
    <form onSubmit={onSubmit}>
      <label>Código<Input required maxLength={20} onChange={(event) => onChange('code', event.target.value)} placeholder="INF-01" value={values.code} /></label>
      <label>Nombre de la especialidad<Input required maxLength={150} onChange={(event) => onChange('name', event.target.value)} value={values.name} /></label>
      <label>Área<Select required onChange={(event) => onChange('area', event.target.value)} value={values.area}><option value="" disabled>Seleccione un área</option>{areaOptions.map((area) => <option key={area} value={area}>{area}</option>)}</Select></label>
      <label>Descripción<Textarea maxLength={2000} onChange={(event) => onChange('description', event.target.value)} value={values.description} /></label>
      <label>Duración (períodos)<Input min={1} max={20} onChange={(event) => onChange('duration', Number(event.target.value))} required type="number" value={values.duration} /></label>
      <label>Estado<Select onChange={(event) => onChange('status', event.target.value as SpecialtyStatus)} value={values.status}><option value="ACTIVE">Activa</option><option value="INACTIVE">Inactiva</option><option value="UNDER_REVIEW">En revisión</option></Select></label>
      <div className={styles.actions}><Button onClick={onCancel} type="button" variant="secondary">Cancelar</Button><Button disabled={isSubmitting} type="submit">{isSubmitting ? 'Guardando…' : 'Guardar cambios'}</Button></div>
    </form>
  </aside>
);

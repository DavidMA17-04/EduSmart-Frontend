import type { FormEventHandler } from 'react';
import type { AcademicPeriod, SectionStatus } from '@/entities/section';
import type { Specialty } from '@/entities/specialty';
import { FormActions, Input, Select, Textarea } from '@/shared/ui';
import type { SectionFormValues } from '../model/useSectionForm';
import styles from './SectionForm.module.css';

interface SectionFormProps {
  title: string;
  values: SectionFormValues;
  specialties: Specialty[];
  academicPeriods: AcademicPeriod[];
  isSubmitting?: boolean;
  onChange: <K extends keyof SectionFormValues>(field: K, value: SectionFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const SectionForm = ({
  title,
  values,
  specialties,
  academicPeriods,
  isSubmitting = false,
  onChange,
  onSubmit,
  onCancel,
}: SectionFormProps) => (
  <aside className={styles.panel}>
    <h2>{title}</h2>
    <form onSubmit={onSubmit}>
      <label>
        Nombre del nivel
        <Input maxLength={150} onChange={(event) => onChange('name', event.target.value)} required value={values.name} />
      </label>
      <label>
        Grado
        <Input max={12} min={1} onChange={(event) => onChange('gradeLevel', Number(event.target.value))} required type="number" value={values.gradeLevel} />
      </label>
      <label>
        Período académico
        <Select onChange={(event) => onChange('academicPeriodId', event.target.value)} required value={values.academicPeriodId}>
          <option disabled value="">Seleccione un período</option>
          {academicPeriods.map((period) => (
            <option key={period.id} value={period.id}>{period.name}</option>
          ))}
        </Select>
      </label>
      <label>
        Especialidad
        <Select onChange={(event) => onChange('specialtyId', event.target.value)} value={values.specialtyId}>
          <option value="">Sin especialidad (grados inferiores)</option>
          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
          ))}
        </Select>
        <span className={styles.hint}>Las especialidades aplican a últimos años; puede quedar vacía en grados inferiores.</span>
      </label>
      <label>
        Descripción
        <Textarea maxLength={2000} onChange={(event) => onChange('description', event.target.value)} value={values.description} />
      </label>
      <label>
        Estado
        <Select onChange={(event) => onChange('status', event.target.value as SectionStatus)} value={values.status}>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </Select>
      </label>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel="Guardar cambios" />
    </form>
  </aside>
);

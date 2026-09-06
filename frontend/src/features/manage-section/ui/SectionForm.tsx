import type { FormEventHandler } from 'react';
import type { AcademicPeriod, SectionStatus } from '@/entities/section';
import { parseNumberField } from '@/shared/lib/number-input';
import { FormActions, Input, Select, Textarea } from '@/shared/ui';
import type { SectionFormValues } from '../model/useSectionForm';
import styles from './SectionForm.module.css';

interface SectionFormProps {
  values: SectionFormValues;
  academicPeriods: AcademicPeriod[];
  isSubmitting?: boolean;
  submitLabel: string;
  onChange: <K extends keyof SectionFormValues>(field: K, value: SectionFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const SectionForm = ({
  values,
  academicPeriods,
  isSubmitting = false,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: SectionFormProps) => (
  <form className={styles.form} onSubmit={onSubmit}>
    <label>
      Nombre del nivel
      <Input maxLength={150} onChange={(event) => onChange('name', event.target.value)} required value={values.name} />
    </label>
    <label>
      Grado
      <Input
        max={12}
        min={1}
        onChange={(event) => onChange('gradeLevel', parseNumberField(event.target.value))}
        placeholder="7"
        required
        type="number"
        value={values.gradeLevel}
      />
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
    <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={submitLabel} />
  </form>
);

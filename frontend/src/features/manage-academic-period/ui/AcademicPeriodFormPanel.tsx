import type { FormEventHandler } from 'react';
import { AcademicPeriodStatusBadge, type AcademicPeriodStatus } from '@/entities/academic-period';
import { FormActions, Input } from '@/shared/ui';
import type { AcademicPeriodFormValues } from '../model/useAcademicPeriodForm';
import styles from './AcademicPeriodFormPanel.module.css';

interface AcademicPeriodFormPanelProps {
  values: AcademicPeriodFormValues;
  status?: AcademicPeriodStatus;
  isReadOnly?: boolean;
  isSubmitting?: boolean;
  submitLabel: string;
  onChange: <K extends keyof AcademicPeriodFormValues>(field: K, value: AcademicPeriodFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const AcademicPeriodFormPanel = ({
  values,
  status,
  isReadOnly = false,
  isSubmitting = false,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: AcademicPeriodFormPanelProps) => (
  <form className={styles.form} onSubmit={onSubmit}>
    <label>
      Nombre
      <Input
        disabled={isReadOnly}
        maxLength={150}
        onChange={(event) => onChange('name', event.target.value)}
        required
        value={values.name}
      />
    </label>
    <label>
      Fecha de inicio
      <Input
        disabled={isReadOnly}
        onChange={(event) => onChange('startDate', event.target.value)}
        required
        type="date"
        value={values.startDate}
      />
    </label>
    <label>
      Fecha de finalización
      <Input
        disabled={isReadOnly}
        min={values.startDate || undefined}
        onChange={(event) => onChange('endDate', event.target.value)}
        required
        type="date"
        value={values.endDate}
      />
    </label>
    <div className={styles.statusField}>
      <span>Estado</span>
      {status
        ? <AcademicPeriodStatusBadge status={status} />
        : <span className={styles.hint}>Se registrará como Planificado.</span>}
    </div>
    <FormActions
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      submitLabel={submitLabel}
      submitProps={{ disabled: isSubmitting || isReadOnly }}
    />
  </form>
);

import type { FormEventHandler } from 'react';
import { AcademicPeriodStatusBadge, type AcademicPeriodStatus } from '@/entities/academic-period';
import { Button, Input } from '@/shared/ui';
import type { AcademicPeriodFormValues } from '../model/useAcademicPeriodForm';
import styles from './AcademicPeriodFormPanel.module.css';

interface AcademicPeriodFormPanelProps {
  title: string;
  values: AcademicPeriodFormValues;
  status?: AcademicPeriodStatus;
  isReadOnly?: boolean;
  isSubmitting?: boolean;
  onChange: <K extends keyof AcademicPeriodFormValues>(field: K, value: AcademicPeriodFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const AcademicPeriodFormPanel = ({
  title,
  values,
  status,
  isReadOnly = false,
  isSubmitting = false,
  onChange,
  onSubmit,
  onCancel,
}: AcademicPeriodFormPanelProps) => (
  <aside className={styles.panel}>
    <h2>{title}</h2>
    <form onSubmit={onSubmit}>
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
      <div className={styles.formActions}>
        <Button disabled={isSubmitting || isReadOnly} type="submit">
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
      </div>
    </form>
  </aside>
);

import type { FormEventHandler, RefObject } from 'react';
import type { SpecialtyStatus } from '@/entities/specialty';
import { FormActions, Input, Select, Textarea } from '@/shared/ui';
import type { SpecialtyFormValues } from '../model/useSpecialtyForm';
import styles from './SpecialtyFormPanel.module.css';

interface SpecialtyFormPanelProps {
  title?: string;
  values: SpecialtyFormValues;
  isSubmitting?: boolean;
  submitLabel: string;
  cancelLabel?: string;
  nameInputRef?: RefObject<HTMLInputElement>;
  nameFieldLabel?: string;
  embedded?: boolean;
  onChange: <K extends keyof SpecialtyFormValues>(field: K, value: SpecialtyFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const SpecialtyFormPanel = ({
  title,
  values,
  isSubmitting = false,
  submitLabel,
  cancelLabel = 'Cancelar',
  nameInputRef,
  nameFieldLabel = 'Nombre',
  embedded = false,
  onChange,
  onSubmit,
  onCancel,
}: SpecialtyFormPanelProps) => {
  const body = (
    <form className={styles.form} onSubmit={onSubmit}>
      <label>
        {nameFieldLabel}
        <Input
          ref={nameInputRef}
          maxLength={150}
          onChange={(event) => onChange('name', event.target.value)}
          required
          value={values.name}
        />
      </label>
      <label>
        Descripción
        <Textarea
          maxLength={2000}
          onChange={(event) => onChange('description', event.target.value)}
          value={values.description}
        />
      </label>
      <label>
        Estado
        <Select
          onChange={(event) => onChange('status', event.target.value as SpecialtyStatus)}
          value={values.status}
        >
          <option value="ACTIVE">Activa</option>
          <option value="INACTIVE">Inactiva</option>
        </Select>
      </label>
      <FormActions
        cancelLabel={cancelLabel}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        submitLabel={submitLabel}
      />
    </form>
  );

  if (embedded) {
    return body;
  }

  return (
    <aside className={styles.panel}>
      {title ? <h2>{title}</h2> : null}
      {body}
    </aside>
  );
};

import type { FormEventHandler } from 'react';
import type { RoleStatus } from '@/entities/role';
import { FormActions, Input, Select, Textarea } from '@/shared/ui';
import type { RoleFormValues } from '../model/useRoleForm';
import styles from './RoleForm.module.css';

interface RoleFormProps {
  values: RoleFormValues;
  isSubmitting?: boolean;
  submitLabel: string;
  onChange: <K extends keyof RoleFormValues>(field: K, value: RoleFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel?: () => void;
}

export const RoleForm = ({ values, isSubmitting = false, submitLabel, onChange, onSubmit, onCancel }: RoleFormProps) => (
  <form className={styles.form} onSubmit={onSubmit}>
    <label>Nombre del rol<Input required maxLength={100} onChange={(event) => onChange('name', event.target.value)} value={values.name} /></label>
    <label>Descripción<Textarea maxLength={2000} onChange={(event) => onChange('description', event.target.value)} value={values.description} /></label>
    <label>Estado<Select onChange={(event) => onChange('status', event.target.value as RoleStatus)} value={values.status}><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option></Select></label>
    <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={submitLabel} />
  </form>
);

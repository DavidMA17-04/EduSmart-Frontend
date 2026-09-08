import type { FormEventHandler } from 'react';
import { FormActions, Input } from '@/shared/ui';
import type { GuideTeacherFormValues } from '../model/useGuideTeacherForm';
import styles from './GroupForm.module.css';

interface GuideTeacherFormProps {
  values: GuideTeacherFormValues;
  errors: Partial<Record<keyof GuideTeacherFormValues, string>>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onChange: <K extends keyof GuideTeacherFormValues>(field: K, value: GuideTeacherFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const GuideTeacherForm = ({
  values,
  errors,
  isSubmitting = false,
  submitLabel = 'Guardar cambios',
  onChange,
  onSubmit,
  onCancel,
}: GuideTeacherFormProps) => (
  <form className={styles.form} onSubmit={onSubmit} noValidate>
    <label>
      Cédula
      <Input
        maxLength={12}
        onChange={(event) => onChange('nationalId', event.target.value)}
        required
        value={values.nationalId}
      />
      {errors.nationalId && <span className={styles.error}>{errors.nationalId}</span>}
    </label>
    <label>
      Nombre
      <Input
        maxLength={80}
        onChange={(event) => onChange('firstName', event.target.value)}
        required
        value={values.firstName}
      />
      {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
    </label>
    <label>
      Apellido 1
      <Input
        maxLength={100}
        onChange={(event) => onChange('firstLastname', event.target.value)}
        required
        value={values.firstLastname}
      />
      {errors.firstLastname && <span className={styles.error}>{errors.firstLastname}</span>}
    </label>
    <label>
      Apellido 2
      <Input
        maxLength={100}
        onChange={(event) => onChange('secondLastname', event.target.value)}
        value={values.secondLastname}
      />
      {errors.secondLastname && <span className={styles.error}>{errors.secondLastname}</span>}
    </label>
    <label>
      Correo
      <Input
        maxLength={150}
        onChange={(event) => onChange('email', event.target.value)}
        required
        type="email"
        value={values.email}
      />
      {errors.email && <span className={styles.error}>{errors.email}</span>}
    </label>
    <label>
      Teléfono
      <Input
        maxLength={30}
        onChange={(event) => onChange('phone', event.target.value)}
        value={values.phone}
      />
    </label>
    <span className={styles.hint}>El docente queda con rol Docente y podrá asignarse a una sección.</span>
    <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={submitLabel} />
  </form>
);

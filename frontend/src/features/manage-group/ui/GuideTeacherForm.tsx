import type { FormEventHandler } from 'react';
import { FormActions, Input } from '@/shared/ui';
import type { GuideTeacherFormValues } from '../model/useGuideTeacherForm';
import styles from './GroupForm.module.css';

interface GuideTeacherFormProps {
  title: string;
  values: GuideTeacherFormValues;
  errors: Partial<Record<keyof GuideTeacherFormValues, string>>;
  isSubmitting?: boolean;
  onChange: <K extends keyof GuideTeacherFormValues>(field: K, value: GuideTeacherFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export const GuideTeacherForm = ({
  title,
  values,
  errors,
  isSubmitting = false,
  onChange,
  onSubmit,
  onCancel,
}: GuideTeacherFormProps) => (
  <aside className={styles.panel}>
    <h2>{title}</h2>
    <form onSubmit={onSubmit} noValidate>
      <label>
        Cédula
        <Input
          required
          maxLength={12}
          value={values.nationalId}
          onChange={(event) => onChange('nationalId', event.target.value)}
        />
        {errors.nationalId && <span className={styles.error}>{errors.nationalId}</span>}
      </label>
      <label>
        Nombre
        <Input
          required
          maxLength={80}
          value={values.firstName}
          onChange={(event) => onChange('firstName', event.target.value)}
        />
        {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
      </label>
      <label>
        Apellidos
        <Input
          required
          maxLength={120}
          value={values.lastName}
          onChange={(event) => onChange('lastName', event.target.value)}
        />
        {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
      </label>
      <label>
        Correo
        <Input
          required
          type="email"
          maxLength={150}
          value={values.email}
          onChange={(event) => onChange('email', event.target.value)}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </label>
      <label>
        Teléfono
        <Input
          maxLength={30}
          value={values.phone}
          onChange={(event) => onChange('phone', event.target.value)}
        />
      </label>
      <span className={styles.hint}>El docente queda con rol Docente y podrá asignarse a una sección.</span>
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel="Guardar cambios" />
    </form>
  </aside>
);

import type { FormEventHandler } from 'react';
import type { Role } from '@/entities/role';
import type { UserAccountStatus } from '@/entities/user';
import { Alert, Checkbox, FormActions, Input, Select } from '@/shared/ui';
import type { UserFormValues } from '../model/useUserForm';
import styles from './UserForm.module.css';

interface UserFormProps {
  values: UserFormValues;
  errors: Partial<Record<keyof UserFormValues, string>>;
  roles: Role[];
  isSubmitting?: boolean;
  submitLabel: string;
  formError?: string | null;
  mode?: 'create' | 'edit';
  onChange: <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel?: () => void;
}

const statusOptions: Array<{ value: UserAccountStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'INACTIVE', label: 'Inactiva' },
  { value: 'BLOCKED', label: 'Bloqueada' },
  { value: 'PENDING', label: 'Pendiente' },
];

export const UserForm = ({
  values,
  errors,
  roles,
  isSubmitting = false,
  submitLabel,
  formError,
  mode = 'create',
  onChange,
  onSubmit,
  onCancel,
}: UserFormProps) => {
  const toggleRole = (roleId: number) => {
    const selected = values.roleIds.includes(roleId)
      ? values.roleIds.filter((id) => id !== roleId)
      : [...values.roleIds, roleId];
    onChange('roleIds', selected);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {formError && <Alert>{formError}</Alert>}

      <div className={styles.row}>
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
          Estado de la cuenta
          <Select
            value={values.status}
            onChange={(event) => onChange('status', event.target.value as UserAccountStatus)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </label>
      </div>

      <div className={styles.row}>
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
      </div>

      <div className={styles.row}>
        <label>
          Correo institucional
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
      </div>

      <label>
        {mode === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña inicial (opcional)'}
        <Input
          type="password"
          autoComplete="new-password"
          maxLength={72}
          value={values.password}
          onChange={(event) => onChange('password', event.target.value)}
        />
        <span className={styles.hint}>
          {mode === 'edit'
            ? 'Si la indica, se actualiza el acceso. Mínimo 8 caracteres.'
            : 'Si la indica, se crea la cuenta de acceso. Mínimo 8 caracteres.'}
        </span>
        {errors.password && <span className={styles.error}>{errors.password}</span>}
      </label>

      <fieldset className={styles.roles}>
        <legend>Roles institucionales</legend>
        <p className={styles.hint}>Obligatorio. Puede seleccionar más de uno.</p>
        {roles.length === 0 ? (
          <p className={styles.error}>No hay roles disponibles. No se puede registrar el usuario sin roles.</p>
        ) : (
          <div className={styles.roleGrid}>
            {roles.map((role) => (
              <label key={role.id} className={styles.roleOption}>
                <Checkbox
                  checked={values.roleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                {role.name}
              </label>
            ))}
          </div>
        )}
        {errors.roleIds && <span className={styles.error}>{errors.roleIds}</span>}
      </fieldset>

      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
};

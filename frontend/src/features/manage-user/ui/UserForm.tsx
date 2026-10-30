import { useState, type FormEventHandler } from 'react';
import type { Department } from '@/entities/department';
import type { AcademicGroup } from '@/entities/group';
import type { Role } from '@/entities/role';
import type { OwnEnrollment, UserAccountStatus } from '@/entities/user';
import { Alert, Button, Checkbox, FormActions, Input, Select } from '@/shared/ui';
import { enrollmentSummary } from '../model/ownGeneralInfo';
import {
  filterGroupsForManualEnrollment,
  formatGroupOptionLabel,
  isGroupAtCapacity,
  roleIsStudent,
  shouldShowManualSectionSelect,
} from '../model/sectionEnrollmentForm';
import type { UserFormValues } from '../model/useUserForm';
import { UserDeactivationModal } from './UserDeactivationModal';
import styles from './UserForm.module.css';

interface UserFormProps {
  values: UserFormValues;
  errors: Partial<Record<keyof UserFormValues, string>>;
  roles: Role[];
  departments?: Department[];
  groups?: AcademicGroup[];
  /** Matrícula vigente: en edit se muestra de solo lectura y no hay traslado. */
  currentEnrollment?: OwnEnrollment | null;
  isSubmitting?: boolean;
  submitLabel: string;
  formError?: string | null;
  mode?: 'create' | 'edit';
  secondarySubmitLabel?: string;
  /** Motivo de baja confirmado (edit). Vacío si aún no se confirmó la inactivación. */
  deactivationReason?: string;
  onDeactivationReasonChange?: (reason: string) => void;
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
  departments = [],
  groups = [],
  currentEnrollment = null,
  isSubmitting = false,
  submitLabel,
  formError,
  mode = 'create',
  secondarySubmitLabel,
  deactivationReason = '',
  onDeactivationReasonChange,
  onChange,
  onSubmit,
  onCancel,
}: UserFormProps) => {
  const [pendingStatus, setPendingStatus] = useState<UserAccountStatus | null>(null);
  const showDeactivationModal = pendingStatus === 'INACTIVE';
  const teacherRoleSelected = roles.some(
    (role) =>
      values.roleIds.includes(role.id) &&
      (role.name === 'Docente' || role.name === 'TEACHER'),
  );
  const studentRoleSelected = roles.some(
    (role) => values.roleIds.includes(role.id) && roleIsStudent(role.name),
  );
  const hasCurrentEnrollment = Boolean(currentEnrollment);
  const showSectionSelect = shouldShowManualSectionSelect(
    mode,
    studentRoleSelected,
    hasCurrentEnrollment,
  );
  const showSectionReadOnly = mode === 'edit' && studentRoleSelected && hasCurrentEnrollment;
  const sectionGroups = filterGroupsForManualEnrollment(groups);

  const toggleRole = (roleId: number) => {
    const selected = values.roleIds.includes(roleId)
      ? values.roleIds.filter((id) => id !== roleId)
      : [...values.roleIds, roleId];
    onChange('roleIds', selected);
    const stillStudent = roles.some(
      (role) => selected.includes(role.id) && roleIsStudent(role.name),
    );
    if (!stillStudent && values.groupId !== '') {
      onChange('groupId', '');
    }
  };

  const handleStatusChange = (next: UserAccountStatus) => {
    if (mode === 'edit' && next === 'INACTIVE' && values.status !== 'INACTIVE') {
      setPendingStatus('INACTIVE');
      return;
    }
    if (next !== 'INACTIVE') {
      onDeactivationReasonChange?.('');
    }
    onChange('status', next);
  };

  return (
    <>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {formError && <Alert>{formError}</Alert>}

        <section className={styles.section} aria-labelledby="user-form-personal">
          <h3 className={styles.sectionTitle} id="user-form-personal">
            Información personal
          </h3>
          <div className={styles.row}>
            <label>
              Nombres *
              <Input
                required
                maxLength={80}
                value={values.firstName}
                onChange={(event) => onChange('firstName', event.target.value)}
              />
              {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
            </label>
            <label>
              Apellidos *
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
              Identificación / cédula *
              <Input
                required
                maxLength={12}
                value={values.nationalId}
                onChange={(event) => onChange('nationalId', event.target.value)}
              />
              {errors.nationalId && <span className={styles.error}>{errors.nationalId}</span>}
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
            Correo electrónico institucional *
            <Input
              required
              type="email"
              maxLength={150}
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
            />
            <span className={styles.hint}>
              Correo institucional de contacto. El acceso al sistema se realiza con la cédula.
            </span>
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </label>
        </section>

        <section className={styles.section} aria-labelledby="user-form-institutional">
          <h3 className={styles.sectionTitle} id="user-form-institutional">
            Información institucional
          </h3>
          <label>
            Estado del usuario *
            <Select
              value={values.status}
              onChange={(event) => handleStatusChange(event.target.value as UserAccountStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {mode === 'edit' && values.status === 'INACTIVE' && deactivationReason ? (
              <span className={styles.hint}>Motivo de baja: {deactivationReason}</span>
            ) : null}
          </label>
          <fieldset className={styles.roles}>
            <legend>Rol *</legend>
            <p className={styles.hint}>Obligatorio. Puede seleccionar más de uno.</p>
            {roles.length === 0 ? (
              <p className={styles.error}>
                No hay roles disponibles. No se puede registrar el usuario sin roles.
              </p>
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
          {teacherRoleSelected ? (
            <label>
              Departamento *
              <Select
                required
                value={values.departmentId === '' ? '' : String(values.departmentId)}
                onChange={(event) =>
                  onChange(
                    'departmentId',
                    event.target.value ? Number(event.target.value) : '',
                  )
                }
              >
                <option value="">Seleccione un departamento</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
              <span className={styles.hint}>
                Obligatorio para docentes (ciencias, matemáticas, informática, cocina, etc.).
              </span>
              {errors.departmentId && (
                <span className={styles.error}>{errors.departmentId}</span>
              )}
            </label>
          ) : null}
          {showSectionReadOnly && currentEnrollment ? (
            <p className={styles.hint} role="status">
              Sección actual: {enrollmentSummary(currentEnrollment)}. El traslado se gestiona en
              Estructura académica.
            </p>
          ) : null}
          {showSectionSelect ? (
            <label>
              Sección {values.status === 'ACTIVE' ? '*' : ''}
              <Select
                required={values.status === 'ACTIVE'}
                value={values.groupId === '' ? '' : String(values.groupId)}
                onChange={(event) =>
                  onChange('groupId', event.target.value ? Number(event.target.value) : '')
                }
              >
                <option value="">Seleccione una sección</option>
                {sectionGroups.map((group) => {
                  const full = isGroupAtCapacity(group);
                  return (
                    <option disabled={full} key={group.id} value={group.id}>
                      {formatGroupOptionLabel(group)}
                      {full ? ' — cupo completo' : ''}
                    </option>
                  );
                })}
              </Select>
              <span className={styles.hint}>
                {values.status === 'ACTIVE'
                  ? 'Obligatorio para estudiantes activos. El alumno queda matriculado en esa sección.'
                  : 'La matrícula solo se aplica a cuentas Activas. Con estado Pendiente no se envía sección.'}
              </span>
              {errors.groupId && <span className={styles.error}>{errors.groupId}</span>}
            </label>
          ) : null}
        </section>

        <section className={styles.section} aria-labelledby="user-form-access">
          <h3 className={styles.sectionTitle} id="user-form-access">
            Información de acceso
          </h3>
          <label>
            {mode === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña temporal *'}
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
                : 'El usuario deberá cambiar esta contraseña temporal al iniciar sesión por primera vez. Mínimo 8 caracteres.'}
            </span>
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </label>
          {mode === 'create' ? (
            <label>
              Confirmar contraseña *
              <Input
                type="password"
                autoComplete="new-password"
                maxLength={72}
                value={values.confirmPassword}
                onChange={(event) => onChange('confirmPassword', event.target.value)}
              />
              {errors.confirmPassword && (
                <span className={styles.error}>{errors.confirmPassword}</span>
              )}
            </label>
          ) : null}
        </section>

        {mode === 'create' && secondarySubmitLabel ? (
          <div className={styles.actions}>
            <Button data-intent="save" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Guardando…' : submitLabel}
            </Button>
            <Button
              data-intent="create-another"
              disabled={isSubmitting}
              type="submit"
              variant="secondary"
            >
              {isSubmitting ? 'Guardando…' : secondarySubmitLabel}
            </Button>
            {onCancel ? (
              <Button onClick={onCancel} type="button" variant="secondary">
                Cancelar
              </Button>
            ) : null}
          </div>
        ) : (
          <FormActions isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={submitLabel} />
        )}
      </form>

      <UserDeactivationModal
        isOpen={showDeactivationModal}
        isSubmitting={false}
        userLabel={[values.firstName, values.lastName].filter(Boolean).join(' ') || undefined}
        onCancel={() => setPendingStatus(null)}
        onConfirm={(reason) => {
          onDeactivationReasonChange?.(reason);
          onChange('status', 'INACTIVE');
          setPendingStatus(null);
        }}
      />
    </>
  );
};

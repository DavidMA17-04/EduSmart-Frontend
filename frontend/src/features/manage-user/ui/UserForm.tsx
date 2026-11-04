import { useState, type FormEventHandler } from 'react';
import { Check, Circle, Eye, EyeOff, Wand2 } from 'lucide-react';
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
import {
  generateCompliantPassword,
  getPasswordRequirements,
  PASSWORD_REQUIREMENT_LABELS,
  type PasswordRequirementId,
} from '../model/userFormRules';
import type { UserFormValues } from '../model/useUserForm';
import { UserDeactivationModal } from './UserDeactivationModal';
import styles from './UserForm.module.css';

const PASSWORD_REQUIREMENT_ORDER: PasswordRequirementId[] = [
  'length',
  'lower',
  'upper',
  'digit',
  'special',
];

interface UserFormProps {
  values: UserFormValues;
  errors: Partial<Record<keyof UserFormValues, string>>;
  roles: Role[];
  rolesError?: string | null;
  onRetryRoles?: () => void;
  departments?: Department[];
  groups?: AcademicGroup[];
  currentEnrollment?: OwnEnrollment | null;
  isSubmitting?: boolean;
  submitLabel: string;
  formError?: string | null;
  mode?: 'create' | 'edit';
  secondarySubmitLabel?: string;
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
  rolesError = null,
  onRetryRoles,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const passwordChecks = getPasswordRequirements(values.password);

  const applyGeneratedPassword = () => {
    const next = generateCompliantPassword(12);
    onChange('password', next);
    if (mode === 'create') {
      onChange('confirmPassword', next);
    }
  };

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

        <div className={styles.columns}>
          <section className={styles.panel} aria-labelledby="user-form-personal">
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
                Correo de contacto. El acceso al sistema es con la cédula.
              </span>
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </label>
          </section>

          <section className={styles.panel} aria-labelledby="user-form-institutional">
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
            <div className={styles.roles}>
              <span className={styles.rolesLabel} id="user-form-roles-label">
                Rol *
              </span>
              <div
                className={styles.rolesBox}
                role="group"
                aria-labelledby="user-form-roles-label"
              >
                {roles.length === 0 ? (
                  <div className={styles.rolesEmpty}>
                    <p className={styles.error}>
                      {rolesError ??
                        'No hay roles disponibles. No se puede registrar el usuario sin roles.'}
                    </p>
                    {onRetryRoles ? (
                      <Button type="button" variant="secondary" onClick={onRetryRoles}>
                        Reintentar carga de roles
                      </Button>
                    ) : null}
                  </div>
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
              </div>
              <span className={styles.hint}>Obligatorio. Puede seleccionar más de uno.</span>
              {errors.roleIds && <span className={styles.error}>{errors.roleIds}</span>}
            </div>
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
        </div>

        <section className={styles.panel} aria-labelledby="user-form-access">
          <h3 className={styles.sectionTitle} id="user-form-access">
            Información de acceso
          </h3>
          <div className={styles.accessBody}>
            <div className={styles.accessFields}>
              <div className={styles.accessRow}>
                <label>
                  {mode === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña temporal *'}
                  <span className={styles.passwordField}>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      maxLength={72}
                      value={values.password}
                      onChange={(event) => onChange('password', event.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? (
                        <EyeOff size={16} aria-hidden="true" />
                      ) : (
                        <Eye size={16} aria-hidden="true" />
                      )}
                    </button>
                  </span>
                  {errors.password && <span className={styles.error}>{errors.password}</span>}
                </label>
                {mode === 'create' ? (
                  <label>
                    Confirmar contraseña *
                    <span className={styles.passwordField}>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        maxLength={72}
                        value={values.confirmPassword}
                        onChange={(event) => onChange('confirmPassword', event.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.togglePassword}
                        aria-label={
                          showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'
                        }
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} aria-hidden="true" />
                        ) : (
                          <Eye size={16} aria-hidden="true" />
                        )}
                      </button>
                    </span>
                    {errors.confirmPassword && (
                      <span className={styles.error}>{errors.confirmPassword}</span>
                    )}
                  </label>
                ) : (
                  <span aria-hidden="true" />
                )}
              </div>
              <div className={styles.generateRow}>
                <Button type="button" variant="secondary" onClick={applyGeneratedPassword}>
                  <Wand2 size={14} aria-hidden="true" />
                  Generar contraseña segura
                </Button>
                {mode === 'create' ? (
                  <span className={styles.hint}>
                    Se completa también la confirmación. El usuario debe cambiarla en el primer
                    inicio.
                  </span>
                ) : (
                  <span className={styles.hint}>Se sugiere solo si actualizará el acceso.</span>
                )}
              </div>
            </div>
            <aside className={styles.passwordRules} aria-label="Requisitos de contraseña">
              <strong>Requisitos</strong>
              <ul className={styles.passwordChecklist}>
                {PASSWORD_REQUIREMENT_ORDER.map((id) => {
                  const met = passwordChecks[id];
                  return (
                    <li
                      key={id}
                      className={met ? styles.requirementMet : styles.requirementPending}
                    >
                      {met ? (
                        <Check size={14} aria-hidden="true" />
                      ) : (
                        <Circle size={14} aria-hidden="true" />
                      )}
                      <span>{PASSWORD_REQUIREMENT_LABELS[id]}</span>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
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

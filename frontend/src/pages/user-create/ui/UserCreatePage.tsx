import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus } from 'lucide-react';
import type { Department } from '@/entities/department';
import type { AcademicGroup } from '@/entities/group';
import type { Role } from '@/entities/role';
import type { AdministrativeUser } from '@/entities/user';
import { departmentApi } from '@/features/manage-department/api/departmentApi';
import { groupApi } from '@/features/manage-group';
import { roleApi } from '@/features/manage-role';
import { UserForm, emptyUserForm, toCreatePayload, useUserForm, userApi } from '@/features/manage-user';
import { enrollmentSummary } from '@/features/manage-user/model/ownGeneralInfo';
import {
  filterGroupsForManualEnrollment,
  roleIsStudent,
} from '@/features/manage-user/model/sectionEnrollmentForm';
import { FeedbackCard, PageHeader, useToast } from '@/shared/ui';
import { HttpError } from '@/shared/api';
import styles from './UserPages.module.css';

function formatCreatedUserName(user: AdministrativeUser) {
  return (
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.email ||
    `#${user.id}`
  );
}

function initialsFromUser(user: AdministrativeUser): string {
  const label = formatCreatedUserName(user);
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('es');
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toLocaleUpperCase('es');
}

function submitIntent(event: FormEvent<HTMLFormElement>): 'save' | 'create-another' {
  const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
  return submitter?.dataset.intent === 'create-another' ? 'create-another' : 'save';
}

export const UserCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const form = useUserForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [rolesReloadKey, setRolesReloadKey] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<AdministrativeUser | null>(null);

  useEffect(() => {
    let active = true;
    setRolesError(null);
    Promise.all([
      roleApi.list().then(
        (items) => ({ items, error: null as string | null }),
        (error: unknown) => ({
          items: [] as Role[],
          error:
            error instanceof HttpError
              ? error.message
              : 'No se pudieron cargar los roles. Verifique la conexión con el servidor.',
        }),
      ),
      departmentApi.listActive().catch(() => [] as Department[]),
      groupApi.list().catch(() => [] as AcademicGroup[]),
    ]).then(([roleResult, departmentItems, groupItems]) => {
      if (!active) return;
      const activeRoles = roleResult.items.filter((role) => role.status === 'ACTIVE');
      setRoles(activeRoles);
      setRolesError(
        roleResult.error ??
          (activeRoles.length === 0
            ? 'La API no devolvió roles activos. Revise Roles y permisos.'
            : null),
      );
      setDepartments(departmentItems);
      setGroups(filterGroupsForManualEnrollment(groupItems));
    });
    return () => {
      active = false;
    };
  }, [rolesReloadKey]);

  const requiresDepartment = roles.some(
    (role) =>
      form.values.roleIds.includes(role.id) &&
      (role.name === 'Docente' || role.name === 'TEACHER'),
  );
  const studentRoleSelected = roles.some(
    (role) => form.values.roleIds.includes(role.id) && roleIsStudent(role.name),
  );
  const requiresGroup = studentRoleSelected && form.values.status === 'ACTIVE';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!form.validate('create', { requiresDepartment, requiresGroup })) return;

    const intent = submitIntent(event);
    setIsSubmitting(true);
    try {
      const user = await userApi.create(toCreatePayload(form.values, { studentRoleSelected }));
      if (intent === 'create-another') {
        form.setValues(emptyUserForm);
        form.setErrors({});
        toast.push('Usuario creado. Puede registrar otro.');
        return;
      }
      setCreatedUser(user);
    } catch (error) {
      setFormError(error instanceof HttpError ? error.message : 'No se pudo crear el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdUser) {
    const fullName = formatCreatedUserName(createdUser);
    const primaryRole = createdUser.roles[0]?.name ?? 'Sin rol';
    const accessEnabled = createdUser.status === 'ACTIVE';

    return (
      <section className={`${styles.page} ${styles.successPage}`}>
        <PageHeader
          breadcrumbs={[
            { label: 'Administrativo' },
            { label: 'Usuarios', to: '/admin/users' },
            { label: 'Registro' },
            { label: 'Confirmación' },
          ]}
          title="Confirmación"
          subtitle="Resultado del registro manual"
        />
        <FeedbackCard
          description="La cuenta ha sido creada y configurada en el sistema institucional."
          links={[
            { label: '← Volver a la lista de usuarios', to: '/admin/users' },
            { label: 'Ir al Dashboard', to: '/admin' },
          ]}
          primaryAction={{
            label: 'Ver ficha del usuario',
            icon: Eye,
            onClick: () => navigate(`/admin/users/${createdUser.id}`),
          }}
          secondaryAction={{
            label: 'Registrar otro usuario',
            icon: UserPlus,
            onClick: () => {
              setCreatedUser(null);
              form.setValues(emptyUserForm);
              form.setErrors({});
            },
          }}
          summary={
            <div className={styles.summaryTicket}>
              <span className={styles.summaryAvatar} aria-hidden="true">
                {initialsFromUser(createdUser)}
              </span>
              <div className={styles.summaryBody}>
                <strong className={styles.summaryName}>{fullName}</strong>
                <span className={styles.summaryEmail}>
                  {createdUser.email ?? 'Sin correo registrado'}
                </span>
                <div className={styles.summaryMeta}>
                  <span className={styles.rolePill}>{primaryRole}</span>
                  {createdUser.enrollment ? (
                    <span className={styles.rolePill}>
                      {enrollmentSummary(createdUser.enrollment)}
                    </span>
                  ) : null}
                  <span
                    className={`${styles.accessChip} ${accessEnabled ? styles.accessOn : styles.accessOff}`}
                  >
                    <i aria-hidden="true" />
                    {accessEnabled ? 'Acceso habilitado' : 'Acceso pendiente'}
                  </span>
                </div>
              </div>
            </div>
          }
          title="¡Usuario registrado con éxito!"
        />
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <PageHeader
        back={{ label: 'Volver a incorporación', to: '/admin/users' }}
        breadcrumbs={[
          { label: 'Administrativo' },
          { label: 'Usuarios', to: '/admin/users' },
          { label: 'Registro manual' },
        ]}
        icon={UserPlus}
        subtitle="Complete los datos personales, institucionales y de acceso. El sistema valida cédula, correo y duplicados."
        title="Registro manual de usuario"
      />

      <div className={styles.createLayout}>
        <details className={styles.helpBanner}>
          <summary>Notas para el registro</summary>
          <ul>
            <li>La cédula y el correo institucional deben ser únicos.</li>
            <li>Debe asignar al menos un rol (solo se listan roles activos).</li>
            <li>
              Estudiante + estado Activa: indique sección; el alumno queda matriculado al
              guardar.
            </li>
            <li>
              <strong>Activa</strong>: puede iniciar sesión de inmediato.{' '}
              <strong>Pendiente</strong>: requiere código por correo (5 min).
            </li>
            <li>
              Contraseña temporal obligatoria; se cambia en el primer inicio. El acceso es con
              la cédula, no con el correo.
            </li>
          </ul>
        </details>

        <UserForm
          values={form.values}
          errors={form.errors}
          roles={roles}
          rolesError={rolesError}
          onRetryRoles={() => setRolesReloadKey((key) => key + 1)}
          departments={departments}
          groups={groups}
          isSubmitting={isSubmitting}
          mode="create"
          submitLabel="Guardar usuario"
          secondarySubmitLabel="Guardar y crear otro"
          formError={formError}
          onChange={form.onChange}
          onSubmit={onSubmit}
          onCancel={() => navigate('/admin/users')}
        />
      </div>
    </section>
  );
};

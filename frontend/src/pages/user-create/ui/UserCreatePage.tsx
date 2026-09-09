import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus } from 'lucide-react';
import { roleApi } from '@/features/manage-role';
import { UserForm, emptyUserForm, toCreatePayload, useUserForm, userApi } from '@/features/manage-user';
import type { Role } from '@/entities/role';
import type { AdministrativeUser } from '@/entities/user';
import { Card, FeedbackCard, PageHeader, useToast } from '@/shared/ui';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<AdministrativeUser | null>(null);

  useEffect(() => {
    let active = true;
    roleApi
      .list()
      .then((items) => {
        if (active) setRoles(items.filter((role) => role.status === 'ACTIVE'));
      })
      .catch(() => {
        if (active) setRoles([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!form.validate('create')) return;

    const intent = submitIntent(event);
    setIsSubmitting(true);
    try {
      const user = await userApi.create(toCreatePayload(form.values));
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

      <div className={styles.layout}>
        <Card className={styles.formCard} padded={false}>
          <div className={styles.formTitle}>
            <h2>Datos del usuario</h2>
          </div>
          <div className={styles.formBody}>
            <UserForm
              values={form.values}
              errors={form.errors}
              roles={roles}
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
        </Card>

        <aside className={styles.sidebar}>
          <Card className={styles.infoCard}>
            <h2>Información</h2>
            <p>Use este formulario para incorporar un usuario de forma individual.</p>
            <ul>
              <li>La cédula y el correo institucional deben ser únicos.</li>
              <li>
                Roles disponibles en el sistema: Administrador, Docente y Estudiante (solo se
                listan roles activos).
              </li>
              <li>Debe asignar al menos un rol institucional.</li>
              <li>
                Estado <strong>Activa</strong>: la cuenta puede iniciar sesión de inmediato (sin
                verificación por correo).
              </li>
              <li>
                Estado <strong>Pendiente</strong>: la cuenta no puede iniciar sesión hasta verificar
                el código enviado por correo (PBI-16).
              </li>
              <li>
                La contraseña temporal es obligatoria. El usuario deberá cambiarla al iniciar
                sesión por primera vez.
              </li>
              <li>El correo institucional es el identificador de acceso (login).</li>
            </ul>
          </Card>
        </aside>
      </div>
    </section>
  );
};

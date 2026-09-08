import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus } from 'lucide-react';
import { roleApi } from '@/features/manage-role';
import { UserForm, emptyUserForm, toCreatePayload, useUserForm, userApi } from '@/features/manage-user';
import type { Role } from '@/entities/role';
import type { AdministrativeUser } from '@/entities/user';
import { Card, FeedbackCard, PageHeader } from '@/shared/ui';
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

export const UserCreatePage = () => {
  const navigate = useNavigate();
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
    if (!form.validate()) return;

    setIsSubmitting(true);
    try {
      const user = await userApi.create(toCreatePayload(form.values));
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
        subtitle="Complete los datos institucionales. El sistema valida cédula, correo y duplicados."
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
              submitLabel="Crear usuario"
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
              <li>La cédula y el correo deben ser únicos.</li>
              <li>Debe asignar al menos un rol institucional.</li>
              <li>La contraseña es opcional; si la indica, habilita el acceso.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </section>
  );
};

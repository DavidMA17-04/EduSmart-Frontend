import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { roleApi } from '@/features/manage-role';
import { UserForm, toCreatePayload, useUserForm, userApi } from '@/features/manage-user';
import type { Role } from '@/entities/role';
import { Alert, Badge, Button, Card } from '@/shared/ui';
import { HttpError } from '@/shared/api';
import styles from '../../user-create/ui/UserPages.module.css';

export const UserDetailPage = () => {
  const { userId = '' } = useParams();
  const { values, errors, setValues, onChange, validate } = useUserForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([userApi.getById(userId), roleApi.list().catch(() => [] as Role[])])
      .then(([user, roleItems]) => {
        if (!active) return;
        setRoles(roleItems);
        setDisplayName(user.name ?? user.email ?? user.id);
        setValues({
          nationalId: user.nationalId ?? '',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          password: '',
          status: user.status,
          roleIds: user.roles.map((role) => role.id),
        });
        setLoadError(null);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof HttpError ? error.message : 'No se pudo cargar el usuario.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [userId, setValues]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const updated = await userApi.update(userId, toCreatePayload(values));
      setDisplayName(updated.name ?? updated.email ?? updated.id);
      setMode('view');
    } catch (error) {
      setFormError(error instanceof HttpError ? error.message : 'No se pudieron guardar los cambios.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <p className={styles.breadcrumb}>Administrativo <span>›</span> Usuarios <span>›</span> Ficha</p>
      <header className={styles.header}>
        <span className={styles.icon}><UserRound size={22} /></span>
        <div>
          <h1>{displayName || 'Consulta de usuario'}</h1>
          <p>Consulte o edite los datos institucionales. La edición queda registrada en auditoría.</p>
        </div>
        {mode === 'view' && !isLoading && !loadError && (
          <Button type="button" onClick={() => setMode('edit')}>Editar</Button>
        )}
      </header>
      {isLoading && <Alert>Cargando usuario…</Alert>}
      {loadError && <Alert>{loadError}</Alert>}
      {!isLoading && !loadError && mode === 'view' && (
        <Card>
          <dl className={styles.details}>
            <div><dt>Cédula</dt><dd>{values.nationalId || '—'}</dd></div>
            <div><dt>Nombre</dt><dd>{values.firstName || '—'}</dd></div>
            <div><dt>Apellidos</dt><dd>{values.lastName || '—'}</dd></div>
            <div><dt>Correo</dt><dd>{values.email || '—'}</dd></div>
            <div><dt>Teléfono</dt><dd>{values.phone || '—'}</dd></div>
            <div><dt>Estado</dt><dd><Badge tone={values.status === 'ACTIVE' ? 'success' : values.status === 'BLOCKED' ? 'danger' : 'warning'}>{values.status}</Badge></dd></div>
            <div><dt>Roles</dt><dd>{values.roleIds.length ? roles.filter((role) => values.roleIds.includes(role.id)).map((role) => role.name).join(', ') || `${values.roleIds.length} asignado(s)` : 'Sin roles'}</dd></div>
          </dl>
        </Card>
      )}
      {!isLoading && !loadError && mode === 'edit' && (
        <Card>
          <UserForm
            values={values}
            errors={errors}
            roles={roles}
            isSubmitting={isSubmitting}
            submitLabel="Guardar cambios"
            formError={formError}
            onChange={onChange}
            onSubmit={onSubmit}
            onCancel={() => setMode('view')}
          />
        </Card>
      )}
      <Link className={styles.backLink} to="/onboarding">Volver a incorporación</Link>
    </section>
  );
};

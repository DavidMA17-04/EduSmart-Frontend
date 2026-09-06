import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { roleApi } from '@/features/manage-role';
import {
  UserAuditPanel,
  UserForm,
  toCreatePayload,
  useUserForm,
  userApi,
  userToFormValues,
} from '@/features/manage-user';
import type { Role } from '@/entities/role';
import type { UserAuditLog } from '@/entities/user';
import { Alert, Button, Card, PageHeader, StatusBadge, type StatusTone } from '@/shared/ui';
import { HttpError } from '@/shared/api';
import styles from '../../user-create/ui/UserPages.module.css';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function userStatusTone(status: string): StatusTone {
  if (status === 'ACTIVE') return 'active';
  if (status === 'BLOCKED') return 'danger';
  if (status === 'INACTIVE') return 'inactive';
  return 'pending';
}

export const UserDetailPage = () => {
  const { userId = '' } = useParams();
  const { values, errors, setValues, onChange, validate } = useUserForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>([]);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditLoading, setIsAuditLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const loadAuditLogs = async (id: number) => {
    setIsAuditLoading(true);
    try {
      const logs = await userApi.getAuditLogs(id);
      setAuditLogs(logs);
      setAuditError(null);
    } catch (error) {
      setAuditError(error instanceof HttpError ? error.message : 'No se pudo cargar el historial de auditoría.');
    } finally {
      setIsAuditLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const id = Number(userId);
    setIsLoading(true);
    setSaveMessage(null);

    Promise.all([userApi.getById(id), roleApi.list().catch(() => [] as Role[])])
      .then(([user, roleItems]) => {
        if (!active) return;
        setRoles(roleItems);
        setDisplayName(user.name ?? user.email ?? String(user.id));
        setCreatedAt(user.createdAt);
        setUpdatedAt(user.updatedAt);
        setValues(userToFormValues(user));
        setLoadError(null);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof HttpError ? error.message : 'No se pudo cargar el usuario.');
      })
      .finally(() => { if (active) setIsLoading(false); });

    void loadAuditLogs(id);

    return () => { active = false; };
  }, [userId, setValues]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaveMessage(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const updated = await userApi.update(Number(userId), toCreatePayload(values));
      setDisplayName(updated.name ?? updated.email ?? String(updated.id));
      setCreatedAt(updated.createdAt);
      setUpdatedAt(updated.updatedAt);
      setValues(userToFormValues(updated));
      setMode('view');
      setSaveMessage('Los cambios se guardaron correctamente y quedaron registrados en auditoría.');
      await loadAuditLogs(Number(userId));
    } catch (error) {
      setFormError(error instanceof HttpError ? error.message : 'No se pudieron guardar los cambios.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader
        back={{ label: 'Volver al directorio', to: '/admin/users/directory' }}
        breadcrumbs={[
          { label: 'Administrativo' },
          { label: 'Usuarios', to: '/admin/users' },
          { label: 'Ficha' },
        ]}
        icon={UserRound}
        primaryAction={
          mode === 'view' && !isLoading && !loadError ? (
            <Button
              type="button"
              onClick={() => {
                setSaveMessage(null);
                setMode('edit');
              }}
            >
              Editar
            </Button>
          ) : undefined
        }
        subtitle="Consulte o edite los datos institucionales. La edición queda registrada en auditoría."
        title={displayName || 'Consulta de usuario'}
      />

      {saveMessage && <Alert>{saveMessage}</Alert>}
      {isLoading && <Alert>Cargando usuario…</Alert>}
      {loadError && <Alert>{loadError}</Alert>}

      {!isLoading && !loadError && mode === 'view' && (
        <div className={styles.layout}>
          <Card className={styles.formCard} padded={false}>
            <div className={styles.formTitle}>
              <h2>Ficha del usuario</h2>
            </div>
            <div className={styles.formBody}>
              <dl className={styles.details}>
                <div><dt>Cédula</dt><dd>{values.nationalId || '—'}</dd></div>
                <div><dt>Nombre</dt><dd>{values.firstName || '—'}</dd></div>
                <div><dt>Apellidos</dt><dd>{values.lastName || '—'}</dd></div>
                <div><dt>Correo</dt><dd>{values.email || '—'}</dd></div>
                <div><dt>Teléfono</dt><dd>{values.phone || '—'}</dd></div>
                <div>
                  <dt>Estado</dt>
                  <dd>
                    <StatusBadge tone={userStatusTone(values.status)} withDot={values.status === 'ACTIVE'}>
                      {values.status}
                    </StatusBadge>
                  </dd>
                </div>
                <div><dt>Roles</dt><dd>{values.roleIds.length ? roles.filter((role) => values.roleIds.includes(role.id)).map((role) => role.name).join(', ') || `${values.roleIds.length} asignado(s)` : 'Sin roles'}</dd></div>
                <div><dt>Creado</dt><dd>{createdAt ? formatDateTime(createdAt) : '—'}</dd></div>
                <div><dt>Última actualización</dt><dd>{updatedAt ? formatDateTime(updatedAt) : '—'}</dd></div>
              </dl>
            </div>
          </Card>
          <aside className={styles.sidebar}>
            <UserAuditPanel error={auditError} isLoading={isAuditLoading} logs={auditLogs} />
            <Card className={styles.infoCard}>
              <h2>Información</h2>
              <p>Consulta de datos institucionales del usuario.</p>
              <ul>
                <li>Use Editar para modificar la ficha.</li>
                <li>Los cambios quedan registrados en auditoría.</li>
              </ul>
            </Card>
          </aside>
        </div>
      )}

      {!isLoading && !loadError && mode === 'edit' && (
        <div className={styles.layout}>
          <Card className={styles.formCard} padded={false}>
            <div className={styles.formTitle}>
              <h2>Editar usuario</h2>
            </div>
            <div className={styles.formBody}>
              <UserForm
                values={values}
                errors={errors}
                roles={roles}
                mode="edit"
                isSubmitting={isSubmitting}
                submitLabel="Guardar cambios"
                formError={formError}
                onChange={onChange}
                onSubmit={onSubmit}
                onCancel={() => { setFormError(null); setMode('view'); }}
              />
            </div>
          </Card>
          <aside className={styles.sidebar}>
            <Card className={styles.infoCard}>
              <h2>Información</h2>
              <p>Actualice solo los datos que requieran corrección.</p>
              <ul>
                <li>La cédula y el correo deben seguir siendo únicos.</li>
                <li>Debe mantener al menos un rol asignado.</li>
                <li>Al guardar se validan los datos y se registra auditoría.</li>
              </ul>
            </Card>
          </aside>
        </div>
      )}
    </section>
  );
};


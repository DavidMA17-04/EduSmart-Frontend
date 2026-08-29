import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Search, Users } from 'lucide-react';
import type { AdministrativeUser } from '@/entities/user';
import { userApi } from '@/features/manage-user';
import { Alert, Badge, Button, Card, Input, Table } from '@/shared/ui';
import { HttpError } from '@/shared/api';
import styles from './UsersDirectoryPage.module.css';

function formatUserName(user: AdministrativeUser) {
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `#${user.id}`;
}

function statusTone(status: AdministrativeUser['status']) {
  if (status === 'ACTIVE') return 'success' as const;
  if (status === 'BLOCKED') return 'danger' as const;
  return 'warning' as const;
}

export const UsersDirectoryPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdministrativeUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    userApi.list()
      .then((items) => { if (active) { setUsers(items); setError(null); } })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof HttpError ? err.message : 'No se pudo cargar el directorio de usuarios.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const haystack = [
        formatUserName(user),
        user.nationalId,
        user.email,
        user.roles.map((role) => role.name).join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [search, users]);

  return (
    <section className={styles.page}>
      <p className={styles.breadcrumb}>
        Administrativo <span>›</span> Usuarios <span>›</span> Consulta y edición
      </p>
      <header className={styles.header}>
        <span className={styles.icon}><Users size={22} /></span>
        <div>
          <h1>Consulta y edición de usuarios</h1>
          <p>Busque un usuario institucional, consulte su ficha y actualice sus datos (WF-18).</p>
        </div>
      </header>

      <Card className={styles.listCard} padded={false}>
        <div className={styles.listHeader}>
          <label className={styles.search}>
            <Search size={15} />
            <Input
              aria-label="Buscar usuario"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, cédula, correo o rol…"
              value={search}
            />
          </label>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/users/new')}>
            Nuevo usuario
          </Button>
        </div>

        {isLoading && <p className={styles.muted}>Cargando usuarios…</p>}
        {error && <div className={styles.alertWrap}><Alert>{error}</Alert></div>}
        {!isLoading && !error && filtered.length === 0 && (
          <p className={styles.muted}>No hay usuarios que coincidan con la búsqueda.</p>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <Table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Cédula</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Roles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>{formatUserName(user)}</td>
                  <td>{user.nationalId ?? '—'}</td>
                  <td>{user.email ?? '—'}</td>
                  <td><Badge tone={statusTone(user.status)}>{user.status}</Badge></td>
                  <td>{user.roles.map((role) => role.name).join(', ') || '—'}</td>
                  <td>
                    <Button
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      type="button"
                      variant="secondary"
                    >
                      <Eye size={14} /> Ver ficha
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Link className={styles.backLink} to="/admin/users">Volver a incorporación</Link>
    </section>
  );
};

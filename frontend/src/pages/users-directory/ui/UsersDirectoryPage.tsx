import { Link, useNavigate } from 'react-router-dom';
import { Eye, Users } from 'lucide-react';
import type { UserAccountStatus } from '@/entities/user';
import { Alert, Badge, Button, Card, Pagination, Table } from '@/shared/ui';
import { UsersDirectoryFilters } from './UsersDirectoryFilters';
import {
  formatUserName,
  STATUS_LABELS,
  useUsersDirectory,
} from '../model/useUsersDirectory';
import styles from './UsersDirectoryPage.module.css';

function statusTone(status: UserAccountStatus) {
  if (status === 'ACTIVE') return 'success' as const;
  if (status === 'BLOCKED') return 'danger' as const;
  return 'warning' as const;
}

export const UsersDirectoryPage = () => {
  const navigate = useNavigate();
  const {
    roles,
    isLoading,
    error,
    statusFilter,
    roleFilter,
    search,
    page,
    totalPages,
    filteredCount,
    totalCount,
    statusCounts,
    roleCounts,
    paginatedUsers,
    hasActiveFilters,
    changeStatus,
    changeRole,
    changeSearch,
    setPage,
    clearFilters,
  } = useUsersDirectory();

  return (
    <section className={styles.page}>
      <p className={styles.breadcrumb}>
        Administrativo <span>›</span> Usuarios <span>›</span> Consulta y edición
      </p>
      <header className={styles.header}>
        <span className={styles.icon}><Users size={22} /></span>
        <div>
          <h1>Consulta y edición de usuarios</h1>
          <p>Filtre por estado o rol con un clic. La búsqueda por texto es opcional (WF-18).</p>
        </div>
      </header>

      <Card className={styles.listCard} padded={false}>
        <div className={styles.listHeader}>
          <div className={styles.resultMeta}>
            <strong>{filteredCount}</strong> de {totalCount} usuarios
          </div>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/users/new')}>
            Nuevo usuario
          </Button>
        </div>

        <UsersDirectoryFilters
          roles={roles}
          statusFilter={statusFilter}
          roleFilter={roleFilter}
          search={search}
          statusCounts={statusCounts}
          roleCounts={roleCounts}
          totalCount={totalCount}
          hasActiveFilters={hasActiveFilters}
          onStatusChange={changeStatus}
          onRoleChange={changeRole}
          onSearchChange={changeSearch}
          onClear={clearFilters}
        />

        {isLoading && <p className={styles.muted}>Cargando usuarios…</p>}
        {error && <div className={styles.alertWrap}><Alert>{error}</Alert></div>}
        {!isLoading && !error && filteredCount === 0 && (
          <p className={styles.muted}>
            {hasActiveFilters
              ? 'No hay usuarios que coincidan con los filtros seleccionados.'
              : 'No hay usuarios registrados todavía.'}
          </p>
        )}

        {!isLoading && !error && paginatedUsers.length > 0 && (
          <>
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
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{formatUserName(user)}</td>
                    <td>{user.nationalId ?? '—'}</td>
                    <td>{user.email ?? '—'}</td>
                    <td>
                      <Badge tone={statusTone(user.status)}>
                        {STATUS_LABELS[user.status]}
                      </Badge>
                    </td>
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

            {totalPages > 1 && (
              <div className={styles.paginationWrap}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <Link className={styles.backLink} to="/admin/users">Volver a incorporación</Link>
    </section>
  );
};

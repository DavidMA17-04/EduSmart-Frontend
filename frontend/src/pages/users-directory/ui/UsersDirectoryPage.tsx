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
          <p>Filtre por estado o rol con un clic. La búsqueda por texto es opcional.</p>
        </div>
      </header>

      <Card className={styles.listCard} padded={false}>
        <div className={styles.listHeader}>
          <div className={styles.resultMeta}>
            <strong>{filteredCount}</strong> de {totalCount} usuarios
          </div>
          <Button type="button" onClick={() => navigate('/admin/users/new')}>
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
            <div className={styles.tableWrap}>
              <Table>
                <thead>
                  <tr>
                    <th className={styles.colUser}>Usuario</th>
                    <th className={styles.colId}>Cédula</th>
                    <th className={styles.colEmail}>Correo</th>
                    <th className={styles.colStatus}>Estado</th>
                    <th className={styles.colRoles}>Roles</th>
                    <th className={styles.colActions}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className={styles.colUser}>
                        <span className={styles.userName}>{formatUserName(user)}</span>
                      </td>
                      <td className={styles.colId}>{user.nationalId ?? '—'}</td>
                      <td className={styles.colEmail}>
                        <span className={styles.email}>{user.email ?? '—'}</span>
                      </td>
                      <td className={styles.colStatus}>
                        <Badge tone={statusTone(user.status)}>
                          {STATUS_LABELS[user.status]}
                        </Badge>
                      </td>
                      <td className={styles.colRoles}>
                        <span className={styles.roles} title={user.roles.map((role) => role.name).join(', ') || undefined}>
                          {user.roles.map((role) => role.name).join(', ') || '—'}
                        </span>
                      </td>
                      <td className={styles.colActions}>
                        <Button
                          aria-label={`Ver ficha de ${formatUserName(user)}`}
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          size="icon"
                          title="Ver ficha"
                          type="button"
                          variant="secondary"
                        >
                          <Eye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

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

import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Users } from 'lucide-react';
import type { UserAccountStatus } from '@/entities/user';
import {
  Alert,
  Button,
  DataTableShell,
  EmptyState,
  PageHeader,
  Pagination,
  RowActionButton,
  RowActions,
  StatusBadge,
  Table,
  type StatusTone,
} from '@/shared/ui';
import { UsersDirectoryFilters } from './UsersDirectoryFilters';
import {
  formatUserName,
  STATUS_LABELS,
  useUsersDirectory,
} from '../model/useUsersDirectory';
import styles from './UsersDirectoryPage.module.css';

function statusTone(status: UserAccountStatus): StatusTone {
  if (status === 'ACTIVE') return 'active';
  if (status === 'BLOCKED') return 'danger';
  if (status === 'INACTIVE') return 'inactive';
  return 'pending';
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
      <PageHeader
        back={{ label: 'Volver a incorporación', to: '/admin/users' }}
        breadcrumbs={[
          { label: 'Administrativo' },
          { label: 'Usuarios', to: '/admin/users' },
          { label: 'Consulta y edición' },
        ]}
        icon={Users}
        primaryAction={
          <Button type="button" onClick={() => navigate('/admin/users/new')}>
            <Plus size={16} /> Nuevo usuario
          </Button>
        }
        subtitle="Filtre por estado o rol. La búsqueda por texto es opcional."
        title="Consulta y edición de usuarios"
      />

      <DataTableShell
        footer={
          totalPages > 1 ? (
            <Pagination currentPage={page} onPageChange={setPage} totalPages={totalPages} />
          ) : null
        }
        toolbar={
          <>
            <div className={styles.resultMeta}>
              <strong>{filteredCount}</strong> de {totalCount} usuarios
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
          </>
        }
      >
        {isLoading && <p className={styles.muted}>Cargando usuarios…</p>}
        {error && (
          <div className={styles.alertWrap}>
            <Alert>{error}</Alert>
          </div>
        )}
        {!isLoading && !error && filteredCount === 0 && (
          <EmptyState
            action={
              hasActiveFilters
                ? { label: 'Limpiar filtros', onClick: clearFilters }
                : { label: 'Registrar usuario', onClick: () => navigate('/admin/users/new'), icon: Plus }
            }
            description={
              hasActiveFilters
                ? 'No hay usuarios que coincidan con los filtros seleccionados.'
                : 'Aún no hay usuarios registrados en la plataforma.'
            }
            icon={Users}
            title="Sin resultados"
          />
        )}

        {!isLoading && !error && paginatedUsers.length > 0 && (
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
                    <StatusBadge tone={statusTone(user.status)} withDot={user.status === 'ACTIVE'}>
                      {STATUS_LABELS[user.status]}
                    </StatusBadge>
                  </td>
                  <td className={styles.colRoles}>
                    <span
                      className={styles.roles}
                      title={user.roles.map((role) => role.name).join(', ') || undefined}
                    >
                      {user.roles.map((role) => role.name).join(', ') || '—'}
                    </span>
                  </td>
                  <td className={styles.colActions}>
                    <RowActions>
                      <RowActionButton
                        aria-label={`Ver ficha de ${formatUserName(user)}`}
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="Ver ficha"
                        tone="primary"
                      >
                        <Eye size={16} />
                      </RowActionButton>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </DataTableShell>
    </section>
  );
};

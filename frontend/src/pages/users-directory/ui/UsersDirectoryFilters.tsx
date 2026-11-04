import { Search } from 'lucide-react';
import type { Role } from '@/entities/role';
import type { UserAccountStatus } from '@/entities/user';
import { Button, Input } from '@/shared/ui';
import type { RoleFilter, StatusFilter } from '../model/useUsersDirectory';
import { STATUS_LABELS } from '../model/useUsersDirectory';
import styles from './UsersDirectoryFilters.module.css';

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: STATUS_LABELS.ACTIVE },
  { value: 'INACTIVE', label: STATUS_LABELS.INACTIVE },
  { value: 'BLOCKED', label: STATUS_LABELS.BLOCKED },
  { value: 'PENDING', label: STATUS_LABELS.PENDING },
];

interface UsersDirectoryFiltersProps {
  roles: Role[];
  statusFilter: StatusFilter;
  roleFilter: RoleFilter;
  search: string;
  statusCounts: Record<StatusFilter, number>;
  roleCounts: Record<number, number>;
  totalCount: number;
  hasActiveFilters: boolean;
  onStatusChange: (value: StatusFilter) => void;
  onRoleChange: (value: RoleFilter) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export const UsersDirectoryFilters = ({
  roles,
  statusFilter,
  roleFilter,
  search,
  statusCounts,
  roleCounts,
  totalCount,
  hasActiveFilters,
  onStatusChange,
  onRoleChange,
  onSearchChange,
  onClear,
}: UsersDirectoryFiltersProps) => (
  <div className={styles.filters}>
    <div className={styles.row}>
      <span className={styles.rowLabel}>Estado</span>
      <div className={styles.chips} role="group" aria-label="Filtrar por estado">
        {STATUS_OPTIONS.map(({ value, label }) => {
          const count = value === 'ALL' ? totalCount : statusCounts[value as UserAccountStatus];
          const active = statusFilter === value;
          return (
            <button
              key={value}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ''}`}
              aria-pressed={active}
              onClick={() => onStatusChange(value)}
            >
              {label}
              <span className={styles.count}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>

    <div className={styles.row}>
      <span className={styles.rowLabel}>Rol</span>
      <div className={styles.chips} role="group" aria-label="Filtrar por rol">
        <button
          type="button"
          className={`${styles.chip} ${roleFilter === 'ALL' ? styles.chipActive : ''}`}
          aria-pressed={roleFilter === 'ALL'}
          onClick={() => onRoleChange('ALL')}
        >
          Todos
          <span className={styles.count}>{totalCount}</span>
        </button>
        {roles.map((role) => {
          const active = roleFilter === role.id;
          return (
            <button
              key={role.id}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ''}`}
              aria-pressed={active}
              onClick={() => onRoleChange(role.id)}
            >
              {role.name}
              <span className={styles.count}>{roleCounts[role.id] ?? 0}</span>
            </button>
          );
        })}
      </div>
    </div>

    <div className={styles.searchRow}>
      <label className={styles.search}>
        <Search size={15} />
        <Input
          aria-label="Búsqueda opcional de usuario"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Búsqueda opcional: nombre, cédula, correo…"
          value={search}
        />
      </label>
      {hasActiveFilters && (
        <Button type="button" variant="secondary" onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  </div>
);

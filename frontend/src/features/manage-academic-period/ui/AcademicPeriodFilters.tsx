import { Search } from 'lucide-react';
import { Input, Select } from '@/shared/ui';
import type { AcademicPeriodStatus } from '@/entities/academic-period';
import type { AcademicPeriodStatusFilter } from '../model/useAcademicPeriods';
import styles from './AcademicPeriodFilters.module.css';

interface AcademicPeriodFiltersProps {
  search: string;
  status: AcademicPeriodStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AcademicPeriodStatusFilter) => void;
}

export const AcademicPeriodFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: AcademicPeriodFiltersProps) => (
  <div className={styles.filters}>
    <label className={styles.search}>
      <Search size={16} />
      <Input
        aria-label="Buscar período académico"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar período…"
        value={search}
      />
    </label>
    <Select
      aria-label="Filtrar por estado"
      onChange={(event) => onStatusChange(event.target.value as AcademicPeriodStatusFilter)}
      value={status}
    >
      <option value="ALL">Estado: Todos</option>
      <option value={'PLANNED' satisfies AcademicPeriodStatus}>Planificados</option>
      <option value={'ACTIVE' satisfies AcademicPeriodStatus}>Activos</option>
      <option value={'CLOSED' satisfies AcademicPeriodStatus}>Cerrados</option>
    </Select>
  </div>
);

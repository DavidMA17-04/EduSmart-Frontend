import { Search } from 'lucide-react';
import { Input, Select } from '@/shared/ui';
import type { SpecialtyStatus } from '@/entities/specialty';
import type { SpecialtyStatusFilter } from '../model/useSpecialties';
import styles from './SpecialtyFilters.module.css';

interface SpecialtyFiltersProps {
  search: string;
  status: SpecialtyStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: SpecialtyStatusFilter) => void;
}

export const SpecialtyFilters = ({ search, status, onSearchChange, onStatusChange }: SpecialtyFiltersProps) => (
  <div className={styles.filters}>
    <label className={styles.search}><Search size={16} /><Input aria-label="Buscar especialidad" onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar especialidad…" value={search} /></label>
    <Select aria-label="Filtrar por estado" onChange={(event) => onStatusChange(event.target.value as SpecialtyStatusFilter)} value={status}><option value="ALL">Estado: Todas</option><option value={'ACTIVE' satisfies SpecialtyStatus}>Activas</option><option value={'INACTIVE' satisfies SpecialtyStatus}>Inactivas</option></Select>
  </div>
);

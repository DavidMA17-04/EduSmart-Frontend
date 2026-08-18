import { Search } from 'lucide-react';
import { Input, Select } from '@/shared/ui';
import type { SpecialtyStatus } from '@/entities/specialty';
import type { SpecialtyStatusFilter } from '../model/useSpecialties';
import styles from './SpecialtyFilters.module.css';

interface SpecialtyFiltersProps {
  areas: string[];
  search: string;
  status: SpecialtyStatusFilter;
  area: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: SpecialtyStatusFilter) => void;
  onAreaChange: (value: string) => void;
}

export const SpecialtyFilters = ({ areas, search, status, area, onSearchChange, onStatusChange, onAreaChange }: SpecialtyFiltersProps) => (
  <div className={styles.filters}>
    <label className={styles.search}><Search size={15} /><Input aria-label="Buscar especialidad" onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar especialidad…" value={search} /></label>
    <Select aria-label="Filtrar por estado" onChange={(event) => onStatusChange(event.target.value as SpecialtyStatusFilter)} value={status}><option value="ALL">Estado: Todas</option><option value={'ACTIVE' satisfies SpecialtyStatus}>Activas</option><option value={'INACTIVE' satisfies SpecialtyStatus}>Inactivas</option><option value={'UNDER_REVIEW' satisfies SpecialtyStatus}>En revisión</option></Select>
    <Select aria-label="Filtrar por área" onChange={(event) => onAreaChange(event.target.value)} value={area}><option value="ALL">Área: Todas</option>{areas.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
  </div>
);

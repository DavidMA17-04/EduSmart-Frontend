import type { ReactNode } from 'react';
import { formatSpecialtyDuration } from '../model/formatters';
import type { Specialty } from '../model/types';
import { SpecialtyStatusBadge } from './SpecialtyStatusBadge';
import styles from './SpecialtyTableRow.module.css';

interface SpecialtyTableRowProps {
  specialty: Specialty;
  isSelected?: boolean;
  onSelect?: (specialtyId: string) => void;
  actions?: ReactNode;
}

export const SpecialtyTableRow = ({ specialty, isSelected = false, onSelect, actions }: SpecialtyTableRowProps) => (
  <tr className={`${styles.row} ${isSelected ? styles.selected : ''}`} onClick={() => onSelect?.(specialty.id)}>
    <td><strong>{specialty.code}</strong></td>
    <td>{specialty.name}</td>
    <td>{specialty.area}</td>
    <td className={styles.description}>{specialty.description || 'Sin descripción'}</td>
    <td>{formatSpecialtyDuration(specialty.duration)}</td>
    <td><SpecialtyStatusBadge status={specialty.status} /></td>
    {actions && <td onClick={(event) => event.stopPropagation()}>{actions}</td>}
  </tr>
);
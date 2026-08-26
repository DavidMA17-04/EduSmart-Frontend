import type { ReactNode } from 'react';
import type { Specialty } from '../model/types';
import { SpecialtyStatusBadge } from './SpecialtyStatusBadge';
import styles from './SpecialtyTableRow.module.css';

interface SpecialtyTableRowProps {
  specialty: Specialty;
  isSelected?: boolean;
  onSelect?: (specialtyId: number) => void;
  actions?: ReactNode;
}

export const SpecialtyTableRow = ({ specialty, isSelected = false, onSelect, actions }: SpecialtyTableRowProps) => (
  <tr className={`${styles.row} ${isSelected ? styles.selected : ''}`} onClick={() => onSelect?.(specialty.id)}>
    <td><strong>{specialty.name}</strong></td>
    <td className={styles.description}>{specialty.description || 'Sin descripción'}</td>
    <td><SpecialtyStatusBadge status={specialty.status} /></td>
    {actions && <td onClick={(event) => event.stopPropagation()}>{actions}</td>}
  </tr>
);

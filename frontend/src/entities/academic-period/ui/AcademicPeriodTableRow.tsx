import type { ReactNode } from 'react';
import { formatAcademicPeriodDate } from '../model/formatters';
import type { AcademicPeriod } from '../model/types';
import { AcademicPeriodStatusBadge } from './AcademicPeriodStatusBadge';
import styles from './AcademicPeriodTableRow.module.css';

interface AcademicPeriodTableRowProps {
  period: AcademicPeriod;
  isSelected?: boolean;
  onSelect?: (periodId: string) => void;
  actions?: ReactNode;
}

export const AcademicPeriodTableRow = ({
  period,
  isSelected = false,
  onSelect,
  actions,
}: AcademicPeriodTableRowProps) => (
  <tr className={`${styles.row} ${isSelected ? styles.selected : ''}`} onClick={() => onSelect?.(period.id)}>
    <td><strong>{period.name}</strong></td>
    <td>{formatAcademicPeriodDate(period.startDate)}</td>
    <td>{formatAcademicPeriodDate(period.endDate)}</td>
    <td><AcademicPeriodStatusBadge status={period.status} /></td>
    {actions && <td onClick={(event) => event.stopPropagation()}>{actions}</td>}
  </tr>
);

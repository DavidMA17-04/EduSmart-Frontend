import type { ReactNode } from 'react';
import { formatStudentCount } from '../model/formatters';
import type { AcademicGroup } from '../model/types';
import styles from './GroupTableRow.module.css';

interface GroupTableRowProps { group: AcademicGroup; isSelected?: boolean; onSelect?: (id: string) => void; actions?: ReactNode; }

export const GroupTableRow = ({ group, isSelected = false, onSelect, actions }: GroupTableRowProps) => <tr className={`${styles.row} ${isSelected ? styles.selected : ''}`} onClick={() => onSelect?.(group.id)}><td><strong>{group.name}</strong></td><td>{formatStudentCount(group.studentCount)}</td><td>{group.guideTeacher?.name || 'Sin asignar'}</td>{actions && <td onClick={(event) => event.stopPropagation()}>{actions}</td>}</tr>;
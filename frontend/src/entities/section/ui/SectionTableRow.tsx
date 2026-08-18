import type { ReactNode } from 'react';
import type { Section } from '../model/types';
import { SectionStatusBadge } from './SectionStatusBadge';
import styles from './SectionTableRow.module.css';

interface SectionTableRowProps { section: Section; isSelected?: boolean; onSelect?: (id: string) => void; actions?: ReactNode; }

export const SectionTableRow = ({ section, isSelected = false, onSelect, actions }: SectionTableRowProps) => <tr className={`${styles.row} ${isSelected ? styles.selected : ''}`} onClick={() => onSelect?.(section.id)}><td><strong>{section.code}</strong></td><td>{section.name}</td><td className={styles.description}>{section.description || 'Sin descripción'}</td><td>{section.groups?.length ?? 0}</td><td><SectionStatusBadge status={section.status} /></td>{actions && <td onClick={(event) => event.stopPropagation()}>{actions}</td>}</tr>;

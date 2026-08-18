import { ShieldCheck, Users } from 'lucide-react';
import type { Role } from '../model/types';
import { RoleStatusBadge } from './RoleStatusBadge';
import styles from './RoleListItem.module.css';

interface RoleListItemProps {
  role: Role;
  isSelected?: boolean;
  onSelect?: (roleId: string) => void;
}

export const RoleListItem = ({ role, isSelected = false, onSelect }: RoleListItemProps) => (
  <button
    aria-pressed={isSelected}
    className={`${styles.item} ${isSelected ? styles.selected : ''}`}
    onClick={() => onSelect?.(role.id)}
    type="button"
  >
    <span className={styles.icon}><ShieldCheck size={19} /></span>
    <span className={styles.content}>
      <strong>{role.name}</strong>
      <small>{role.description || 'Sin descripción'}</small>
    </span>
    <span className={styles.meta}>
      <RoleStatusBadge status={role.status} />
      {role.assignedUsersCount !== undefined && <small><Users size={12} /> {role.assignedUsersCount}</small>}
    </span>
  </button>
);

import React from 'react';
import { UserRole, USER_ROLE_LABELS } from '@/types/user';
import styles from './UserRoleBadge.module.css';

interface UserRoleBadgeProps {
  role: string | UserRole;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const isKnownRole = Object.values(UserRole).includes(role as UserRole);

  if (!isKnownRole) {
    return (
      <span className={`${styles.badge} ${styles.invalid}`} title="Rol no reconocido">
        ⚠️ {String(role || 'Sin Rol')}
      </span>
    );
  }

  const roleEnum = role as UserRole;
  const label = USER_ROLE_LABELS[roleEnum];

  const classMap: Record<UserRole, string> = {
    [UserRole.STUDENT]: styles.student,
    [UserRole.TEACHER]: styles.teacher,
    [UserRole.ADMINISTRATIVE]: styles.administrative,
    [UserRole.DIRECTIVE]: styles.directive,
  };

  return (
    <span className={`${styles.badge} ${classMap[roleEnum]}`}>
      {label}
    </span>
  );
};

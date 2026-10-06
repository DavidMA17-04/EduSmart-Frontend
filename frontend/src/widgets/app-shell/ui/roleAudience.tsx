import { createContext, useContext, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import {
  resolveRoleAudience,
  studentHomePath,
  type RoleAudience,
} from '../model/adminNavigation';

export const RoleAudienceContext = createContext<RoleAudience | null>(null);

export function useRoleAudience(): RoleAudience {
  return (
    useContext(RoleAudienceContext) ??
    resolveRoleAudience(getSessionUser()?.roles)
  );
}

export function roleAudienceLabel(audience: RoleAudience): string {
  if (audience === 'teacher') return 'Docente';
  if (audience === 'student') return 'Estudiante';
  return 'Administración';
}

/** Envuelve pantallas según el rol resuelto por RoleShell. */
export function RoleGate({
  allow,
  children,
}: {
  allow: 'staff' | 'student';
  children: ReactNode;
}) {
  const audience = useRoleAudience();
  const isStudent = audience === 'student';
  const allowed = allow === 'student' ? isStudent : !isStudent;
  if (!allowed) {
    return (
      <Navigate
        replace
        to={isStudent ? studentHomePath(sessionHasPermission) : '/admin'}
      />
    );
  }
  return children;
}

/** Ruta de personal: el alumno no entra aunque tenga el permiso. */
export function StaffOnly() {
  return (
    <RoleGate allow="staff">
      <Outlet />
    </RoleGate>
  );
}

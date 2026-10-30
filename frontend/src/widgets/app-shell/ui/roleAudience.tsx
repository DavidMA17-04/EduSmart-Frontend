import { createContext, useContext, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getSessionUser } from '@/shared/auth';
import {
  resolveRoleAudience,
  type RoleAudience,
} from '../model/adminNavigation';
import {
  houseHomeOrLogin,
  isStaffHouse,
  resolveHouse,
} from '../model/territory';

export const RoleAudienceContext = createContext<RoleAudience | null>(null);

export function useRoleAudience(): RoleAudience {
  return (
    useContext(RoleAudienceContext) ??
    resolveRoleAudience(getSessionUser()?.roles)
  );
}

export function roleAudienceLabel(
  audience: RoleAudience,
  roles?: readonly string[],
): string {
  if (audience === 'teacher') return 'Docente';
  if (audience === 'staff') {
    const effective = roles ?? getSessionUser()?.roles ?? [];
    const names = effective.map((role) => role.toLowerCase());
    if (names.includes('director')) return 'Dirección';
    if (names.includes('orientador')) return 'Orientación';
    return 'Personal';
  }
  if (audience === 'student') return 'Estudiante';
  if (audience === 'guardian') return 'Encargado';
  return 'Administración';
}

/** Envuelve pantallas según la casa. El encargado no es personal. */
export function RoleGate({
  allow,
  children,
}: {
  allow: 'staff' | 'student' | 'guardian';
  children: ReactNode;
}) {
  const house = resolveHouse(getSessionUser()?.roles);
  const allowed =
    allow === 'staff'
      ? isStaffHouse(house)
      : allow === 'student'
        ? house === 'student'
        : house === 'guardian';
  if (!allowed) {
    return <Navigate replace to={houseHomeOrLogin(getSessionUser()?.roles)} />;
  }
  return children;
}

/** Ruta de personal: alumno y encargado no entran. */
export function StaffOnly() {
  return (
    <RoleGate allow="staff">
      <Outlet />
    </RoleGate>
  );
}

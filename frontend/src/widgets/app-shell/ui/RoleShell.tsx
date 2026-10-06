import { useAuthStore } from '@/features/auth';
import { resolveRoleAudience } from '../model/adminNavigation';
import { AdminShell } from './AdminShell';
import { RoleAudienceContext } from './roleAudience';

/** Wrapper de la sesión: fija el rol y monta el shell que corresponde. */
export function RoleShell() {
  const roles = useAuthStore((state) => state.user?.roles);
  const audience = resolveRoleAudience(roles && roles.length > 0 ? roles : undefined);

  return (
    <RoleAudienceContext.Provider value={audience}>
      <AdminShell />
    </RoleAudienceContext.Provider>
  );
}

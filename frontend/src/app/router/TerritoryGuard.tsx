import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSessionUser } from '@/shared/auth';
import { resolveTerritoryNavigation, resolveHouse } from '@/widgets/app-shell/model/territory';

/** Fail-closed: casa ajena rebota al home. No cierra sesión. */
export function TerritoryGuard() {
  const location = useLocation();
  const session = getSessionUser();
  const bounce = resolveTerritoryNavigation(location.pathname, session?.roles);
  if (bounce) {
    return <Navigate replace to={`${bounce}${bounce === `/${resolveHouse(session?.roles)}` ? '' : location.search + location.hash}`} />;
  }
  return <Outlet />;
}

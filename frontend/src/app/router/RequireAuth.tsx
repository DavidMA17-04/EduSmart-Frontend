import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { getSessionUser } from '@/shared/auth';
import {
  isForcedPasswordPathAllowed,
  resolveHouse,
  settingsPath,
} from '@/widgets/app-shell/model/territory';

export const RequireAuth = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  const session = getSessionUser();
  const house = resolveHouse(session?.roles);
  if (!house) {
    return <Navigate replace to="/login" />;
  }

  if (
    session?.mustChangePassword &&
    !isForcedPasswordPathAllowed(location.pathname, house)
  ) {
    return <Navigate replace to={settingsPath(house)} />;
  }

  return <Outlet />;
};

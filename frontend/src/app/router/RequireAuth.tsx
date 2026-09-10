import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAccessToken, getSessionUser } from '@/shared/auth';

export const RequireAuth = () => {
  const location = useLocation();

  if (!getAccessToken()) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  const session = getSessionUser();
  const allowedWhileForced =
    location.pathname === '/admin/settings' || location.pathname === '/admin/profile';
  if (session?.mustChangePassword && !allowedWhileForced) {
    return <Navigate replace to="/admin/settings" />;
  }

  return <Outlet />;
};

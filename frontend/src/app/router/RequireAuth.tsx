import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { getSessionUser } from '@/shared/auth';

export const RequireAuth = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
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

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAccessToken } from '@/shared/auth';

export const RequireAuth = () => {
  const location = useLocation();

  if (!getAccessToken()) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
};

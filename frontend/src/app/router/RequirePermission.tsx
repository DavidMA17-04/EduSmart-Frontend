import { Navigate, Outlet } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';

export const RequirePermission = ({ permission }: { permission: string }) => {
  if (!sessionHasPermission(permission)) {
    return <Navigate replace to="/admin" />;
  }
  return <Outlet />;
};

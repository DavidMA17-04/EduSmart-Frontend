import { Navigate, Outlet } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';

export const RequirePermission = ({
  permission,
  withoutPermission,
}: {
  permission: string;
  /** When set, access is denied if the session also has this permission. */
  withoutPermission?: string;
}) => {
  if (!sessionHasPermission(permission)) {
    return <Navigate replace to="/admin" />;
  }
  if (withoutPermission && sessionHasPermission(withoutPermission)) {
    return <Navigate replace to="/admin" />;
  }
  return <Outlet />;
};

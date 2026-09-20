import { Navigate, Outlet } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';

export const RequirePermission = ({
  permission,
  anyOf,
  withoutPermission,
}: {
  permission?: string;
  /** Access if the session has ANY of these permissions. */
  anyOf?: readonly string[];
  /** When set, access is denied if the session also has this permission. */
  withoutPermission?: string;
}) => {
  const allowed = anyOf?.length
    ? anyOf.some((code) => sessionHasPermission(code))
    : permission
      ? sessionHasPermission(permission)
      : false;

  if (!allowed) {
    return <Navigate replace to="/admin" />;
  }
  if (withoutPermission && sessionHasPermission(withoutPermission)) {
    return <Navigate replace to="/admin" />;
  }
  return <Outlet />;
};

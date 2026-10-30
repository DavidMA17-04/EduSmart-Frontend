import { Navigate, Outlet } from 'react-router-dom';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { houseHomeOrLogin } from '@/widgets/app-shell/model/territory';

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
  const bounce = houseHomeOrLogin(getSessionUser()?.roles);
  const allowed = anyOf?.length
    ? anyOf.some((code) => sessionHasPermission(code))
    : permission
      ? sessionHasPermission(permission)
      : false;

  if (!allowed) {
    return <Navigate replace to={bounce} />;
  }
  if (withoutPermission && sessionHasPermission(withoutPermission)) {
    return <Navigate replace to={bounce} />;
  }
  return <Outlet />;
};

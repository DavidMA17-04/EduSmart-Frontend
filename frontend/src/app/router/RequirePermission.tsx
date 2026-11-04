import { Navigate, Outlet } from 'react-router-dom';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { NotFoundPage } from '@/pages/errors';
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
  const allowed = anyOf?.length
    ? anyOf.some((code) => sessionHasPermission(code))
    : permission
      ? sessionHasPermission(permission)
      : false;

  if (!allowed) {
    // Sin permiso se responde igual que una dirección inexistente: no se
    // confirma que la sección exista para roles que no la tienen.
    return <NotFoundPage />;
  }
  if (withoutPermission && sessionHasPermission(withoutPermission)) {
    // Ruta alternativa (p. ej. "Mi horario" vs. "Horarios"): vuelve al inicio.
    return <Navigate replace to={houseHomeOrLogin(getSessionUser()?.roles)} />;
  }
  return <Outlet />;
};

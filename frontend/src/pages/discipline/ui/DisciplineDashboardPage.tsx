import { Navigate } from 'react-router-dom';
import { DISCIPLINE_HOME_PATH } from '@/features/manage-discipline';
import { portalPathForSession } from '@/shared/auth/portalPaths';
import { useRoleAudience } from '@/widgets/app-shell';

/** Alias legacy: el tablero vive en el landing unificado. */
export const DisciplineDashboardPage = () => {
  const audience = useRoleAudience();
  if (audience === 'guardian' || audience === 'student') {
    return (
      <Navigate
        replace
        to={audience === 'guardian' ? '/guardian/discipline/notifications' : '/student'}
      />
    );
  }

  return <Navigate replace to={portalPathForSession(DISCIPLINE_HOME_PATH)} />;
};

export default DisciplineDashboardPage;

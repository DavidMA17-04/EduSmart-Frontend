import { Navigate } from 'react-router-dom';
import { AdminHomePage } from '@/pages/admin-home';
import { DISCIPLINE_NOTIFICATIONS_PATH } from '@/features/manage-discipline';
import { RoleGate, useRoleAudience } from '@/widgets/app-shell';

/** El panel administrativo queda dentro del wrapper de personal. */
export const RoleHome = () => {
  const audience = useRoleAudience();
  if (audience === 'guardian') {
    return <Navigate replace to={DISCIPLINE_NOTIFICATIONS_PATH} />;
  }

  return (
    <RoleGate allow="staff">
      <AdminHomePage />
    </RoleGate>
  );
};

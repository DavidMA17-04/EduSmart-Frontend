import { AdminHomePage } from '@/pages/admin-home';
import { StaffRoleHomePage } from '@/pages/role-home';
import { getSessionUser } from '@/shared/auth';
import { RoleGate } from '@/widgets/app-shell';
import { resolveHouse } from '@/widgets/app-shell/model/territory';

/** Index dashboard of a staff house. Each role keeps its own panel. */
export const RoleHome = () => {
  const house = resolveHouse(getSessionUser()?.roles);
  const Page = house === 'admin' || !house ? AdminHomePage : StaffRoleHomePage;
  return (
    <RoleGate allow="staff">
      <Page />
    </RoleGate>
  );
};

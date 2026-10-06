import { AdminHomePage } from '@/pages/admin-home';
import { RoleGate } from '@/widgets/app-shell';

/** El panel administrativo queda dentro del wrapper de personal. */
export const RoleHome = () => (
  <RoleGate allow="staff">
    <AdminHomePage />
  </RoleGate>
);

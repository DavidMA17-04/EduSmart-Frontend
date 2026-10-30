import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { DISCIPLINE_PERMISSIONS, DisciplineDashboardPanel } from '@/features/manage-discipline';
import { useAuthStore } from '@/features/auth';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import {
  adminNavigationItems,
  filterAdminNavigation,
} from '@/widgets/app-shell/model/adminNavigation';
import {
  houseHome,
  resolveHouse,
  type TerritoryHouse,
} from '@/widgets/app-shell/model/territory';
import { AttendanceDashboardPanel } from '@/widgets/attendance-dashboard-panel';
import { MySchedulePanel } from '@/widgets/my-schedule-panel';
import { HouseWelcome } from '@/pages/admin-home/ui/HouseWelcome';
import { profileDisplayName } from '@/pages/admin-home/model/profileDisplayName';
import styles from '@/pages/admin-home/ui/AdminHomePage.module.css';

const SUBTITLE: Record<Extract<TerritoryHouse, 'teacher' | 'counselor' | 'director'>, string> = {
  teacher: 'Panel del docente',
  counselor: 'Panel de orientación',
  director: 'Panel de dirección',
};

export const StaffRoleHomePage = () => {
  const storedUser = useAuthStore((state) => state.user);
  const sessionUser = getSessionUser();
  const house = resolveHouse(sessionUser?.roles);
  const subtitle =
    house === 'teacher' || house === 'counselor' || house === 'director'
      ? SUBTITLE[house]
      : 'Panel de trabajo';
  const displayName = profileDisplayName(
    storedUser ?? (sessionUser ? { email: sessionUser.email } : null),
    'Usuario',
  );
  const home = house ? houseHome(house) : '';
  const shortcuts = filterAdminNavigation(
    adminNavigationItems,
    sessionHasPermission,
    sessionUser?.roles,
  ).filter((item) => item.to !== home).slice(0, 8);

  const showAttendance =
    sessionHasPermission('attendance.view') || sessionHasPermission('attendance.view_own');
  const showSchedule =
    house === 'teacher' &&
    (sessionHasPermission('schedules.view_own') || sessionHasPermission('schedules.view'));
  const showDisciplineBoard =
    (house === 'counselor' || house === 'director') &&
    (sessionHasPermission('disciplinary.view') || sessionHasPermission('disciplinary.view_own'));

  return (
    <section className={styles.page}>
      <HouseWelcome name={displayName} subtitle={subtitle} />

      {showAttendance ? <AttendanceDashboardPanel variant="compact" /> : null}
      {showSchedule ? <MySchedulePanel /> : null}
      {showDisciplineBoard ? (
        <DisciplineDashboardPanel
          canExport={sessionHasPermission(DISCIPLINE_PERMISSIONS.export)}
        />
      ) : null}

      {shortcuts.length > 0 ? (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <Zap size={18} />
            <h2>Accesos rápidos</h2>
          </div>
          <div className={styles.qaGrid}>
            {shortcuts.map(({ label, to, icon: Icon }) => (
              <Link key={to + label} className={styles.qaItem} to={to}>
                <div className={styles.qaIcon}>
                  <Icon size={20} />
                </div>
                <span className={styles.qaLabel}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <footer className={styles.footer}>
        © 2026 EduSmart – CTP Hojancha. Todos los derechos reservados.
      </footer>
    </section>
  );
};

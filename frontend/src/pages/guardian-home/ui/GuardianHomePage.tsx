import { Link } from 'react-router-dom';
import { Bell, ClipboardList, GraduationCap, Settings } from 'lucide-react';
import { GuardianInboxPanel } from '@/features/manage-discipline';
import { RepresentedStudentsPanel } from '@/features/manage-user';
import { useAuthStore } from '@/features/auth';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { HouseWelcome } from '@/pages/admin-home/ui/HouseWelcome';
import { profileDisplayName } from '@/pages/admin-home/model/profileDisplayName';
import studentStyles from '@/pages/student-home/ui/StudentHomePage.module.css';
import adminStyles from '@/pages/admin-home/ui/AdminHomePage.module.css';

const LINKS = [
  {
    to: '/guardian/discipline/notifications',
    label: 'Notificaciones',
    hint: 'Avisos disciplinarios de tus representados',
    icon: Bell,
    show: () => sessionHasPermission('disciplinary.respond'),
  },
  {
    to: '/guardian/discipline',
    label: 'Historial de conducta',
    hint: 'Expedientes de estudiantes a tu cargo',
    icon: GraduationCap,
    show: () =>
      sessionHasPermission('disciplinary.view_own') ||
      sessionHasPermission('disciplinary.view'),
  },
  {
    to: '/guardian/attendance',
    label: 'Asistencia',
    hint: 'Marcas de los estudiantes representados',
    icon: ClipboardList,
    show: () =>
      sessionHasPermission('attendance.view_own') ||
      sessionHasPermission('attendance.view'),
  },
  {
    to: '/guardian/settings',
    label: 'Configuración',
    hint: 'Perfil y contraseña',
    icon: Settings,
    show: () => true,
  },
] as const;

export const GuardianHomePage = () => {
  const storedUser = useAuthStore((state) => state.user);
  const sessionUser = getSessionUser();
  const displayName = profileDisplayName(
    storedUser ?? (sessionUser ? { email: sessionUser.email } : null),
    'Encargado',
  );
  const showInbox = sessionHasPermission('disciplinary.respond');

  return (
    <section className={adminStyles.page}>
      <HouseWelcome name={displayName} subtitle="Panel del encargado" />
      <RepresentedStudentsPanel />
      <ul className={studentStyles.grid}>
        {LINKS.filter((item) => item.show()).map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link className={studentStyles.card} to={item.to}>
                <Icon aria-hidden="true" size={22} />
                <span className={studentStyles.label}>{item.label}</span>
                <span className={studentStyles.hint}>{item.hint}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {showInbox ? <GuardianInboxPanel /> : null}
      <footer className={adminStyles.footer}>
        © 2026 EduSmart – CTP Hojancha. Todos los derechos reservados.
      </footer>
    </section>
  );
};

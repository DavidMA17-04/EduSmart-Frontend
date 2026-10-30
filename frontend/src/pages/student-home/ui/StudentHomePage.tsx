import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  GraduationCap,
  History,
  KeyRound,
  Settings,
} from 'lucide-react';
import type { AdministrativeUser } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { userApi } from '@/features/manage-user';
import { userHasStudentRole } from '@/features/manage-user/model/ownGeneralInfo';
import { getSessionUser, sessionHasPermission } from '@/shared/auth';
import { HouseWelcome } from '@/pages/admin-home/ui/HouseWelcome';
import { profileDisplayName } from '@/pages/admin-home/model/profileDisplayName';
import { MySchedulePanel } from '@/widgets/my-schedule-panel';
import adminStyles from '@/pages/admin-home/ui/AdminHomePage.module.css';
import styles from './StudentHomePage.module.css';

const LINKS = [
  {
    to: '/student/attendance',
    label: 'Historial de asistencia',
    hint: 'Tus marcas por lección',
    icon: History,
    show: () =>
      sessionHasPermission('attendance.view_own') ||
      sessionHasPermission('attendance.view'),
  },
  {
    to: '/student/attendance/justifications',
    label: 'Justificaciones',
    hint: 'Solicitudes de ausencia',
    icon: ClipboardList,
    show: () =>
      sessionHasPermission('attendance.justify') ||
      sessionHasPermission('attendance.view_own') ||
      sessionHasPermission('attendance.view'),
  },
  {
    to: '/student/attendance/redeem',
    label: 'Ingresar código',
    hint: 'Marca asistencia con el código de clase',
    icon: KeyRound,
    show: () => true,
  },
  {
    to: '/student/discipline',
    label: 'Mi conducta',
    hint: 'Historial disciplinario propio',
    icon: GraduationCap,
    show: () =>
      sessionHasPermission('disciplinary.view_own') ||
      sessionHasPermission('disciplinary.view'),
  },
  {
    to: '/student/settings',
    label: 'Configuración',
    hint: 'Perfil y contraseña',
    icon: Settings,
    show: () => true,
  },
] as const;

export const StudentHomePage = () => {
  const storedUser = useAuthStore((state) => state.user);
  const sessionUser = getSessionUser();
  const displayName = profileDisplayName(
    storedUser ?? (sessionUser ? { email: sessionUser.email } : null),
    'Estudiante',
  );
  const [profile, setProfile] = useState<AdministrativeUser | null>(null);

  useEffect(() => {
    let active = true;
    void userApi
      .getMe()
      .then((me) => {
        if (active) setProfile(me);
      })
      .catch(() => {
        if (active) setProfile(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const student = userHasStudentRole(profile);
  const emptyKind = student && !profile?.enrollment ? 'no-enrollment' : 'no-schedule';
  const sectionLabel =
    profile?.enrollment?.sectionLabel ?? profile?.enrollment?.groupName ?? null;

  return (
    <section className={adminStyles.page}>
      <HouseWelcome name={displayName} subtitle="Panel del estudiante" />
      <MySchedulePanel emptyKind={emptyKind} sectionLabel={sectionLabel} />
      <ul className={styles.grid}>
        {LINKS.filter((item) => item.show()).map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link className={styles.card} to={item.to}>
                <Icon aria-hidden="true" size={22} />
                <span className={styles.label}>{item.label}</span>
                <span className={styles.hint}>{item.hint}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <footer className={adminStyles.footer}>
        © 2026 EduSmart – CTP Hojancha. Todos los derechos reservados.
      </footer>
    </section>
  );
};

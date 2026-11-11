import {
  ClipboardPen,
  GraduationCap,
  Home,
  Inbox,
  Scale,
  Settings,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import {
  DISCIPLINE_APPEALS_PATH,
  DISCIPLINE_CASES_PATH,
  DISCIPLINE_HISTORY_PATH,
  DISCIPLINE_HOME_PATH,
  DISCIPLINE_PERMISSIONS,
  DISCIPLINE_REGISTER_PATH,
  DISCIPLINE_SETTINGS_PATH,
} from '../model/disciplineRouting';
import styles from './DisciplineModuleNav.module.css';

type NavItem = {
  key: string;
  label: string;
  to: string;
  icon: typeof Home;
  end?: boolean;
  visible: boolean;
};

export function DisciplineModuleNav() {
  const canCreate = sessionHasPermission(DISCIPLINE_PERMISSIONS.create);
  const canCases =
    sessionHasPermission(DISCIPLINE_PERMISSIONS.view) ||
    sessionHasPermission(DISCIPLINE_PERMISSIONS.viewOwn);
  const canSettings =
    sessionHasPermission(DISCIPLINE_PERMISSIONS.view) ||
    sessionHasPermission(DISCIPLINE_PERMISSIONS.configure);

  const items: NavItem[] = [
    {
      key: 'home',
      label: 'Inicio',
      to: DISCIPLINE_HOME_PATH,
      icon: Home,
      end: true,
      visible: true,
    },
    {
      key: 'register',
      label: 'Registrar',
      to: DISCIPLINE_REGISTER_PATH,
      icon: ClipboardPen,
      visible: canCreate,
    },
    {
      key: 'cases',
      label: 'Expedientes',
      to: DISCIPLINE_CASES_PATH,
      icon: Inbox,
      visible: canCases,
    },
    {
      key: 'history',
      label: 'Historial',
      to: DISCIPLINE_HISTORY_PATH,
      icon: GraduationCap,
      visible: canCases,
    },
    {
      key: 'appeals',
      label: 'Apelaciones',
      to: DISCIPLINE_APPEALS_PATH,
      icon: Scale,
      visible: canCases,
    },
    {
      key: 'settings',
      label: 'Configuración',
      to: DISCIPLINE_SETTINGS_PATH,
      icon: Settings,
      visible: canSettings,
    },
  ];

  return (
    <nav aria-label="Secciones de Disciplina" className={styles.nav}>
      {items
        .filter((item) => item.visible)
        .map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              className={({ isActive }) =>
                `${styles.link}${isActive ? ` ${styles.active}` : ''}`
              }
              end={item.end}
              key={item.key}
              to={staffPathForSession(item.to)}
            >
              <Icon aria-hidden="true" size={15} />
              {item.label}
            </NavLink>
          );
        })}
    </nav>
  );
}

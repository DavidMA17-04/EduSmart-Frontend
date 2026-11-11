import { Home, Inbox, Megaphone, PenSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';
import { staffPathForSession } from '@/widgets/app-shell/model/adminNavigation';
import {
  COMMUNICATIONS_FEED_PATH,
  COMMUNICATIONS_HOME_PATH,
  COMMUNICATIONS_MANAGE_PATH,
  COMMUNICATIONS_PERMISSIONS,
} from '../model/communicationsRouting';
import styles from './CommunicationsModuleNav.module.css';

export function CommunicationsModuleNav() {
  const canManage = sessionHasPermission(COMMUNICATIONS_PERMISSIONS.create);
  const items = [
    { key: 'home', label: 'Inicio', to: COMMUNICATIONS_HOME_PATH, icon: Home, end: true, visible: true },
    { key: 'feed', label: 'Muro', to: COMMUNICATIONS_FEED_PATH, icon: Inbox, visible: true },
    {
      key: 'manage',
      label: 'Gestor',
      to: COMMUNICATIONS_MANAGE_PATH,
      icon: Megaphone,
      visible: canManage,
    },
    {
      key: 'compose',
      label: 'Redactar',
      to: `${COMMUNICATIONS_MANAGE_PATH}?compose=1`,
      icon: PenSquare,
      visible: canManage,
    },
  ];

  return (
    <nav aria-label="Secciones de Avisos y comunicados" className={styles.nav}>
      {items
        .filter((item) => item.visible)
        .map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
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

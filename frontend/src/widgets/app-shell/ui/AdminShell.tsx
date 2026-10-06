import { useState } from 'react';
import { Bell, ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authApi, useAuthStore } from '@/features/auth';
import { sessionHasPermission } from '@/shared/auth';
import { runAppEnterTransition } from '@/shared/motion/runAppEnterTransition';
import { Button, Modal } from '@/shared/ui';
import {
  adminNavigationItems,
  filterAdminNavigation,
  groupAdminNavigation,
  type AdminNavItem,
} from '../model/adminNavigation';
import { roleAudienceLabel, useRoleAudience } from './roleAudience';
import styles from './AdminShell.module.css';

const SIDEBAR_COLLAPSED_KEY = 'edusmart.sidebar.collapsed';

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function navClass(isActive: boolean, nested = false) {
  return `${styles.navItem} ${nested ? styles.navChild : ''} ${isActive ? styles.active : ''}`;
}

function routeMatches(pathname: string, to: string, exact: boolean) {
  if (pathname === to) return true;
  if (exact) return false;
  return pathname.startsWith(`${to}/`);
}

function SidebarLink({
  item,
  nested = false,
  exact = false,
  onNavigate,
}: {
  item: AdminNavItem;
  nested?: boolean;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      className={({ isActive }) => navClass(isActive, nested)}
      end={item.to === '/admin' || exact}
      onClick={onNavigate}
      title={item.label}
      to={item.to}
    >
      <Icon aria-hidden="true" size={nested ? 16 : 18} />
      <span className={styles.navLabel}>{item.label}</span>
    </NavLink>
  );
}

export const AdminShell = () => {
  const navigate = useNavigate();
  const sessionUser = useAuthStore((state) => state.user);
  const email = sessionUser?.email ?? 'Sesión activa';
  const displayName = sessionUser?.name
    ? `${sessionUser.name}${sessionUser.first_lastname ? ` ${sessionUser.first_lastname}` : ''}`
    : (sessionUser?.roles[0] ?? 'Usuario');
  const avatarLetter = (email[0] ?? 'U').toUpperCase();
  const location = useLocation();
  const audience = useRoleAudience();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>({});
  const navigation = groupAdminNavigation(
    filterAdminNavigation(
      adminNavigationItems,
      sessionHasPermission,
      sessionUser?.roles ?? [],
      audience,
    ),
  );

  const onLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      setLogoutOpen(false);
      // Cover first while session is still active, then logout + navigate under the curtain.
      await runAppEnterTransition(async () => {
        await authApi.logout();
        navigate('/login', { replace: true });
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`admin-shell ${styles.shell}`}>
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.brand}>
          <img
            alt="Escudo C.T.P. de Hojancha"
            className={styles.brandLogo}
            src="/brand/ctp-hojancha-logo.jpeg"
          />
          <span className={styles.brandTitle}>C.T.P. de Hojancha</span>
          <small className={styles.roleAudience}>{roleAudienceLabel(audience)}</small>
          <small>Colegio Técnico Profesional</small>
          <small className={styles.brandMotto}>Ciencia · Cultura · 1972</small>
        </div>
        <nav aria-label="Navegación principal" className={styles.navigation}>
          {navigation.map((entry) => {
            if (entry.type === 'link') {
              return <SidebarLink item={entry.item} key={entry.item.to} />;
            }

            const leadHasNestedChildren = entry.children.some((child) =>
              child.to.startsWith(`${entry.lead.to}/`),
            );
            const routeOpen =
              routeMatches(location.pathname, entry.lead.to, false) ||
              entry.children.some((child) =>
                routeMatches(location.pathname, child.to, false),
              );
            const expanded = groupOpen[entry.id] ?? routeOpen;
            const panelId = `nav-group-${entry.id}`;

            return (
              <div className={styles.navGroup} key={entry.id}>
                <div className={styles.navGroupRow}>
                  <SidebarLink
                    exact={leadHasNestedChildren}
                    item={entry.lead}
                    onNavigate={() =>
                      setGroupOpen((current) => ({ ...current, [entry.id]: true }))
                    }
                  />
                  {!sidebarCollapsed ? (
                  <button
                    aria-controls={panelId}
                    aria-expanded={expanded}
                    aria-label={
                      expanded
                        ? `Ocultar opciones de ${entry.lead.label}`
                        : `Mostrar opciones de ${entry.lead.label}`
                    }
                    className={styles.navToggle}
                    onClick={() =>
                      setGroupOpen((current) => ({
                        ...current,
                        [entry.id]: !expanded,
                      }))
                    }
                    type="button"
                  >
                    <ChevronDown
                      aria-hidden="true"
                      className={expanded ? styles.navToggleOpen : undefined}
                      size={16}
                    />
                  </button>
                  ) : null}
                </div>
                {expanded && !sidebarCollapsed ? (
                  <div className={styles.navChildren} id={panelId}>
                    {entry.children.map((child) => (
                      <SidebarLink item={child} key={child.to} nested />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <button
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? 'Mostrar menú' : 'Ocultar menú'}
          className={styles.collapseButton}
          onClick={() =>
            setSidebarCollapsed((current) => {
              const next = !current;
              try {
                localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
              } catch {
                /* ignore private mode */
              }
              return next;
            })
          }
          type="button"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen aria-hidden="true" size={18} />
          ) : (
            <PanelLeftClose aria-hidden="true" size={18} />
          )}
          <span>{sidebarCollapsed ? 'Mostrar' : 'Ocultar menú'}</span>
        </button>
        <div className={styles.account}>
          <span className={styles.avatar}>{avatarLetter}</span>
          <span>
            <strong>{displayName}</strong>
            <small>{email}</small>
          </span>
        </div>
      </aside>
      <section className={styles.main}>
        <header className={styles.header}>
          <button aria-label="Notificaciones" className={styles.iconButton} type="button">
            <Bell size={20} />
          </button>
          <button className={styles.profile} onClick={() => navigate('/admin/settings')} type="button">
            <span className={styles.headerAvatar}>{avatarLetter}</span>
            <span>
              <strong>{displayName}</strong>
              <small>{email}</small>
            </span>
            <ChevronDown size={16} />
          </button>
          <button className={styles.logout} onClick={() => setLogoutOpen(true)} type="button">
            <LogOut aria-hidden="true" size={16} />
            Cerrar sesión
          </button>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </section>

      <Modal
        isOpen={logoutOpen}
        onClose={() => {
          if (!isLoggingOut) setLogoutOpen(false);
        }}
        title="Cerrar sesión"
      >
        <div className={styles.logoutModal}>
          <p className={styles.logoutMessage}>¿Seguro que desea salir del sistema?</p>
          <p className={styles.logoutSecondary}>Se cerrará la sesión de EduSmart.</p>
          <div className={styles.logoutActions}>
            <Button
              disabled={isLoggingOut}
              onClick={() => setLogoutOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button disabled={isLoggingOut} onClick={onLogout} type="button" variant="danger">
              {isLoggingOut ? 'Saliendo…' : 'Salir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

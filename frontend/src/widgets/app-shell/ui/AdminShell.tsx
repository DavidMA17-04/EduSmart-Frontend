import { useState } from 'react';
import { Bell, CalendarRange, ChevronDown, FileBarChart, GraduationCap, Layers, LayoutDashboard, LogOut, Settings, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi, useAuthStore } from '@/features/auth';
import { sessionHasPermission } from '@/shared/auth';
import { Button, Modal } from '@/shared/ui';
import styles from './AdminShell.module.css';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Usuarios', icon: Users, to: '/admin/users', permission: 'administrator.view' },
  { label: 'Roles y permisos', icon: ShieldCheck, to: '/admin/roles-permissions', permission: 'roles_permissions.view' },
  { label: 'Estructura académica', icon: GraduationCap, to: '/admin/specialties', permission: 'specialties.view' },
  { label: 'Períodos académicos', icon: CalendarRange, to: '/admin/academic-periods', permission: 'periods.view' },
  { label: 'Niveles y secciones', icon: Layers, to: '/admin/sections-groups', permission: 'sections.view' },
  { label: 'Reportes', icon: FileBarChart, to: '/admin/reports', permission: 'administrator.view' },
  { label: 'Configuración', icon: Settings, to: '/admin/settings' },
];

export const AdminShell = () => {
  const navigate = useNavigate();
  const sessionUser = useAuthStore((state) => state.user);
  const email = sessionUser?.email ?? 'Sesión activa';
  const displayName = sessionUser?.name
    ? `${sessionUser.name}${sessionUser.first_lastname ? ` ${sessionUser.first_lastname}` : ''}`
    : (sessionUser?.roles[0] ?? 'Usuario');
  const avatarLetter = (email[0] ?? 'U').toUpperCase();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <div className={`admin-shell ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img
            alt="Escudo C.T.P. de Hojancha"
            className={styles.brandLogo}
            src="/brand/ctp-hojancha-logo.jpeg"
          />
          <span className={styles.brandTitle}>C.T.P. de Hojancha</span>
          <small>Colegio Técnico Profesional</small>
          <small className={styles.brandMotto}>Ciencia · Cultura · 1972</small>
        </div>
        <nav aria-label="Navegación principal" className={styles.navigation}>
          {navigationItems
            .filter((item) => !item.permission || sessionHasPermission(item.permission))
            .map(({ label, icon: Icon, to }) => (
            <NavLink
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              end={to === '/admin'}
              key={to}
              to={to}
            >
              <Icon aria-hidden="true" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
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

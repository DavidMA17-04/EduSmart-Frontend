import { useState } from 'react';
import { ArrowLeft, Bell, CalendarRange, ChevronDown, FileBarChart, GraduationCap, Layers, LayoutDashboard, LogOut, Settings, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth';
import { getSessionUser } from '@/shared/auth';
import { Button, Modal } from '@/shared/ui';
import styles from './AdminShell.module.css';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Usuarios', icon: Users, to: '/admin/users' },
  { label: 'Roles y permisos', icon: ShieldCheck, to: '/admin/roles-permissions' },
  { label: 'Estructura académica', icon: GraduationCap, to: '/admin/specialties' },
  { label: 'Períodos académicos', icon: CalendarRange, to: '/admin/academic-periods' },
  { label: 'Niveles y secciones', icon: Layers, to: '/admin/sections-groups' },
  { label: 'Reportes', icon: FileBarChart, to: '/admin/reports' },
  { label: 'Configuración', icon: Settings, to: '/admin/settings' },
];

export const AdminShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/dashboard';
  const sessionUser = getSessionUser();
  const email = sessionUser?.email ?? 'Sesión activa';
  const displayName = sessionUser?.roles[0] ?? 'Usuario';
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
          <GraduationCap aria-hidden="true" size={34} strokeWidth={1.8} />
          <span>EduSmart</span>
          <small>Gestión Académica Integral</small>
        </div>
        <p className={styles.institution}>CTP HOJANCHA</p>
        <nav aria-label="Navegación principal" className={styles.navigation}>
          {navigationItems.map(({ label, icon: Icon, to }) => (
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
          <button className={styles.profile} type="button">
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
          {!isDashboard && (
            <div className={styles.backWrap}>
              <button
                className={styles.backButton}
                onClick={() => navigate('/admin')}
                type="button"
              >
                <ArrowLeft size={18} />
                Regresar al Dashboard Administrativo
              </button>
            </div>
          )}
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

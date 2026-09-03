import { Bell, CalendarRange, ChevronDown, GraduationCap, Layers, LayoutDashboard, LogOut, Settings, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth';
import { getSessionUser } from '@/shared/auth';
import styles from './AdminShell.module.css';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Usuarios', icon: Users, to: '/admin/users' },
  { label: 'Roles y permisos', icon: ShieldCheck, to: '/admin/roles-permissions' },
  { label: 'Estructura académica', icon: GraduationCap, to: '/admin/specialties' },
  { label: 'Períodos académicos', icon: CalendarRange, to: '/admin/academic-periods' },
  { label: 'Niveles y secciones', icon: Layers, to: '/admin/sections-groups' },
  { label: 'Configuración', icon: Settings, to: '/admin/settings' },
];

export const AdminShell = () => {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();
  const email = sessionUser?.email ?? 'Sesión activa';
  const displayName = sessionUser?.roles[0] ?? 'Usuario';
  const avatarLetter = (email[0] ?? 'U').toUpperCase();

  const onLogout = async () => {
    await authApi.logout();
    navigate('/login', { replace: true });
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
          <button className={styles.logout} onClick={onLogout} type="button">
            <LogOut aria-hidden="true" size={16} />
            Cerrar sesión
          </button>
        </header>
        <main className={styles.content}><Outlet /></main>
      </section>
    </div>
  );
};

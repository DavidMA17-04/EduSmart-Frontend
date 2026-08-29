import { Bell, CalendarRange, ChevronDown, GraduationCap, Layers, LayoutDashboard, Settings, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
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

export const AdminShell = () => (
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
      <nav className={styles.navigation} aria-label="Navegación principal">
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
        <span className={styles.avatar}>A</span>
        <span><strong>Administrador</strong><small>admin@ctphojancha.ed.cr</small></span>
      </div>
    </aside>
    <section className={styles.main}>
      <header className={styles.header}>
        <button aria-label="Notificaciones" className={styles.iconButton} type="button"><Bell size={20} /></button>
        <button className={styles.profile} type="button"><span className={styles.headerAvatar}>A</span><span><strong>Administrador</strong><small>Portal administrativo</small></span><ChevronDown size={16} /></button>
      </header>
      <main className={styles.content}><Outlet /></main>
    </section>
  </div>
);

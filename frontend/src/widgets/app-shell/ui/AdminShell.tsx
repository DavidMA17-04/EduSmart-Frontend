import { Bell, ChevronDown, GraduationCap, Layers, LayoutDashboard, Settings, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminShell.module.css';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Usuarios', icon: Users, to: '/admin/users' },
  { label: 'Roles y permisos', icon: ShieldCheck, to: '/admin/roles-permissions' },
  { label: 'Estructura académica', icon: GraduationCap, to: '/admin/specialties' },
  { label: 'Niveles y secciones', icon: Layers, to: '/admin/sections-groups' },
  { label: 'Configuración', icon: Settings, to: '/admin/settings' },
];

export const AdminShell = () => (
  <div className={`admin-shell ${styles.shell}`}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <GraduationCap aria-hidden="true" size={34} strokeWidth={1.8} />
        <span>EduSmart</span>
        <small>Gestión Académica Integral</small>
      </div>
      <p className={styles.institution}>CTP HOJANCHA</p>
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
        <button className={styles.profile} type="button"><span className={styles.headerAvatar}>A</span><span><strong>Administrador</strong><small>Administrador</small></span><ChevronDown size={16} /></button>
      </header>
      <main className={styles.content}><Outlet /></main>
    </section>
  </div>
);
import React from 'react';
import { Users, LayoutDashboard, Settings, Bell, BookOpen } from 'lucide-react';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar Nav */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>E</div>
          <div>
            <div className={styles.brandTitle}>C.T.P. de Hojancha</div>
            <div className={styles.brandSub}>Colegio Técnico Profesional</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <a href="#dashboard" className={styles.navItem}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>
          <a href="#users" className={`${styles.navItem} ${styles.navItemActive}`}>
            <Users size={18} />
            <span>Usuarios & Carga</span>
          </a>
          <a href="#sections" className={styles.navItem}>
            <BookOpen size={18} />
            <span>Secciones</span>
          </a>
          <a href="#settings" className={styles.navItem}>
            <Settings size={18} />
            <span>Configuración</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Panel de Administración • CTP Hojancha
          </div>

          <div className={styles.userBadge}>
            <Bell size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
            <div className={styles.avatar}>A</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Admin CTP</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>admin@ctphojancha.ed.cr</div>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
};

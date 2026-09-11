import { useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircleHelp } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { getSessionUser } from '@/shared/auth';
import { InstitutionStatsCard } from './InstitutionStatsCard';
import { LoginFlow } from './LoginFlow';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const location = useLocation();
  const resetDone = Boolean((location.state as { resetDone?: boolean } | null)?.resetDone);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const wasAuthenticatedOnMount = useRef(useAuthStore.getState().isAuthenticated);

  if (isAuthenticated && wasAuthenticatedOnMount.current) {
    const session = getSessionUser();
    return <Navigate replace to={session?.mustChangePassword ? '/admin/settings' : '/admin'} />;
  }

  return (
    <div className={`admin-shell ${styles.layout}`}>
      <aside className={styles.hero}>
        <div className={styles.heroAura} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGlowSecondary} aria-hidden="true" />
        <div className={styles.heroPattern} aria-hidden="true" />

        <div className={styles.heroTop}>
          <img
            alt="Escudo C.T.P. de Hojancha"
            className={styles.heroCrest}
            src="/brand/ctp-hojancha-logo.jpeg"
          />
          <p className={styles.heroSchool}>C.T.P. de Hojancha</p>
          <h1 className={styles.heroTitle}>EduSmart</h1>
          <p className={styles.heroMotto}>Ciencia · Cultura · 1972</p>
          <p className={styles.heroCopy}>
            Panel institucional para usuarios, estructura académica y la gestión diaria del colegio.
          </p>
        </div>

        <InstitutionStatsCard />
      </aside>

      <section className={styles.panel}>
        <div className={styles.card}>
          <LoginFlow resetDone={resetDone} />
        </div>

        <p className={styles.help}>
          <CircleHelp aria-hidden="true" size={14} />
          ¿Necesitas ayuda? Contacta al administrador.
        </p>
        <p className={styles.copyright}>© 2026 EduSmart · CTP Hojancha</p>
      </section>
    </div>
  );
};

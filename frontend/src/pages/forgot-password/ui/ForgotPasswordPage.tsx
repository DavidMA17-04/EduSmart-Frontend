import { ArrowLeft, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import styles from './ForgotPasswordPage.module.css';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  return (
    <div className={`admin-shell ${styles.layout}`}>
      <section className={styles.panel}>
        <div className={styles.card}>
          <div className={styles.iconWrap} aria-hidden="true">
            <KeyRound size={28} />
          </div>
          <h1 className={styles.title}>Recuperar contraseña</h1>
          <p className={styles.copy}>
            La recuperación de credenciales formará parte del PBI-18. Por ahora,
            contacta al administrador del sistema si necesitas restablecer el acceso.
          </p>
          <Button className={styles.back} onClick={() => navigate('/login')} type="button">
            <ArrowLeft aria-hidden="true" size={16} />
            Volver al inicio de sesión
          </Button>
        </div>
        <p className={styles.copyright}>© 2026 EduSmart · CTP Hojancha</p>
      </section>
    </div>
  );
};

import { Settings } from 'lucide-react';
import styles from './AdminHomePage.module.css';

export const AdminHomePage = () => (
  <section className={styles.page}>
    <p className={styles.breadcrumb}>Administrativo</p>
    <div className={styles.card}>
      <Settings aria-hidden="true" size={28} />
      <div><h1>Configuración institucional</h1><p>Selecciona un módulo administrativo desde el menú lateral.</p></div>
    </div>
  </section>
);

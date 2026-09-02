import { CalendarRange } from 'lucide-react';
import { AcademicPeriodsPanel } from '@/widgets/academic-periods-panel';
import styles from './AcademicPeriodsPage.module.css';

export const AcademicPeriodsPage = () => (
  <section className={styles.page}>
    <p className={styles.breadcrumb}>
      Administrativo <span>›</span> Estructura académica <span>›</span> Períodos académicos
    </p>
    <header className={styles.header}>
      <span className={styles.icon}>
        <CalendarRange size={22} />
      </span>
      <div>
        <h1>Gestión de Períodos Académicos</h1>
        <p>Defina los períodos lectivos institucionales y controle su activación y cierre.</p>
      </div>
    </header>
    <AcademicPeriodsPanel />
  </section>
);

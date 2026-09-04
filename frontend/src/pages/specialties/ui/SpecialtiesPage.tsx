import { GraduationCap } from 'lucide-react';
import { AcademicOfferHub } from '@/widgets/academic-offer-hub';
import styles from './SpecialtiesPage.module.css';

export const SpecialtiesPage = () => (
  <section className={styles.page}>
    <p className={styles.breadcrumb}>
      Administrativo <span>›</span> Estructura académica <span>›</span> Oferta académica
    </p>
    <header className={styles.header}>
      <span className={styles.icon}>
        <GraduationCap size={22} />
      </span>
      <div>
        <h1>Oferta académica</h1>
        <p>Talleres exploratorios y especialidades técnicas del CTP Hojancha.</p>
      </div>
    </header>
    <AcademicOfferHub />
  </section>
);

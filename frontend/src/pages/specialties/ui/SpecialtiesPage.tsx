import { GraduationCap } from 'lucide-react';
import { AcademicOfferHub } from '@/widgets/academic-offer-hub';
import { PageHeader } from '@/shared/ui';
import styles from './SpecialtiesPage.module.css';

export const SpecialtiesPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver al panel', to: '/admin' }}
      breadcrumbs={[
        { label: 'Administrativo' },
        { label: 'Estructura académica' },
        { label: 'Oferta académica' },
      ]}
      icon={GraduationCap}
      subtitle="Talleres exploratorios y especialidades técnicas del CTP Hojancha."
      title="Oferta académica"
    />
    <AcademicOfferHub />
  </section>
);

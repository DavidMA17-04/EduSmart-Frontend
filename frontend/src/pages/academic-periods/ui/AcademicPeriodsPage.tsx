import { CalendarRange } from 'lucide-react';
import { AcademicPeriodsPanel } from '@/widgets/academic-periods-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AcademicPeriodsPage.module.css';

export const AcademicPeriodsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver al panel', to: '/admin' }}
      breadcrumbs={[
        { label: 'Administrativo' },
        { label: 'Estructura académica', to: '/admin/specialties' },
        { label: 'Períodos académicos' },
      ]}
      icon={CalendarRange}
      subtitle="Defina los períodos lectivos institucionales y controle su activación y cierre."
      title="Gestión de Períodos Académicos"
    />
    <AcademicPeriodsPanel />
  </section>
);

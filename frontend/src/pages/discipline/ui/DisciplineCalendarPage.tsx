import { CalendarOff } from 'lucide-react';
import { DisciplineCalendarPanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineCalendarPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Calendario y umbrales' }]}
      icon={CalendarOff}
      subtitle="Días que no cuentan en los plazos y los umbrales de reincidencia y nota de conducta."
      title="Calendario y umbrales"
    />
    <DisciplineCalendarPanel />
  </section>
);

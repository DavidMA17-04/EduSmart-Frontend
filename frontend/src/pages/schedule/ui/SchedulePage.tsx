import { CalendarClock } from 'lucide-react';
import { SchedulePanel } from '@/widgets/schedule-panel';
import { PageHeader } from '@/shared/ui';
import styles from './SchedulePage.module.css';

export const SchedulePage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Administrativo' },
        { label: 'Horario semanal' },
      ]}
      icon={CalendarClock}
      subtitle="Configura las clases asignadas por día y bloque horario."
      title="Horario semanal"
    />
    <SchedulePanel />
  </section>
);

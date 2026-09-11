import { CalendarClock } from 'lucide-react';
import { MY_SCHEDULE_COPY } from '@/features/view-my-schedule';
import { MySchedulePanel } from '@/widgets/my-schedule-panel';
import { PageHeader } from '@/shared/ui';
import styles from './MySchedulePage.module.css';

export const MySchedulePage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Administrativo' }, { label: MY_SCHEDULE_COPY.title }]}
      icon={CalendarClock}
      subtitle={MY_SCHEDULE_COPY.subtitle}
      title={MY_SCHEDULE_COPY.title}
    />
    <MySchedulePanel />
  </section>
);

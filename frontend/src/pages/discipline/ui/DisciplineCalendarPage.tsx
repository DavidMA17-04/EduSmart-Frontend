import { portalPathForSession } from '@/shared/auth/portalPaths';
import { CalendarOff } from 'lucide-react';
import {
  DISCIPLINE_SETTINGS_PATH,
  DisciplineCalendarPanel,
  DisciplineModuleNav,
} from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineCalendarPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Disciplina' },
        { label: 'Configuración', to: portalPathForSession(DISCIPLINE_SETTINGS_PATH) },
        { label: 'Calendario y umbrales' },
      ]}
      icon={CalendarOff}
      subtitle="Días no hábiles para plazos, y umbrales de reincidencia y alerta de conducta."
      title="Calendario y umbrales"
    />
    <DisciplineModuleNav />
    <DisciplineCalendarPanel />
  </section>
);

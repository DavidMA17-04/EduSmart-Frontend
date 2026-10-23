import { Bell } from 'lucide-react';
import { GuardianInboxPanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineNotificationsPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Notificaciones' }]}
      icon={Bell}
      subtitle="Abra un aviso. La acción que corresponde a esa carta queda al frente; las demás siguen disponibles."
      title="Notificaciones"
    />
    <GuardianInboxPanel />
  </section>
);

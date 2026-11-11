import { Scale } from 'lucide-react';
import { AppealsHubPanel, DisciplineModuleNav } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineAppealsPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Apelaciones' }]}
      icon={Scale}
      subtitle="Presente un recurso, revise pendientes o consulte reportes. Abajo ve sus recursos."
      title="Apelaciones y recursos"
    />
    <DisciplineModuleNav />
    <AppealsHubPanel />
  </section>
);

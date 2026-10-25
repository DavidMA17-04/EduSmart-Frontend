import { Scale } from 'lucide-react';
import { APPEAL_CENTER_COPY, AppealsHubPanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineAppealsPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: APPEAL_CENTER_COPY.title }]}
      icon={Scale}
      subtitle={APPEAL_CENTER_COPY.subtitle}
      title={APPEAL_CENTER_COPY.title}
    />
    <AppealsHubPanel />
  </section>
);

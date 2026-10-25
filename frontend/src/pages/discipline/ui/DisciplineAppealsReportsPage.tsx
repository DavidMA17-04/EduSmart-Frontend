import { FileBarChart } from 'lucide-react';
import { APPEAL_REPORTS_COPY, AppealsReportsPanel, DISCIPLINE_APPEALS_PATH } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineAppealsReportsPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Disciplina' },
        { label: 'Centro de apelaciones', to: DISCIPLINE_APPEALS_PATH },
        { label: APPEAL_REPORTS_COPY.title },
      ]}
      icon={FileBarChart}
      subtitle={APPEAL_REPORTS_COPY.subtitle}
      title={APPEAL_REPORTS_COPY.title}
    />
    <AppealsReportsPanel />
  </section>
);

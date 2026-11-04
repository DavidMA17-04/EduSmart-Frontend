import { portalPathForSession } from '@/shared/auth/portalPaths';
import { History } from 'lucide-react';
import { APPEAL_TRACKING_COPY, AppealTrackingPanel, DISCIPLINE_APPEALS_PATH } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineAppealTrackingPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Disciplina' },
        { label: 'Centro de apelaciones', to: portalPathForSession(DISCIPLINE_APPEALS_PATH) },
        { label: APPEAL_TRACKING_COPY.title },
      ]}
      icon={History}
      subtitle={APPEAL_TRACKING_COPY.subtitle}
      title={APPEAL_TRACKING_COPY.title}
    />
    <AppealTrackingPanel />
  </section>
);

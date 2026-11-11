import { portalPathForSession } from '@/shared/auth/portalPaths';
import { ClipboardList } from 'lucide-react';
import {
  APPEAL_REVIEW_COPY,
  AppealsReviewPanel,
  DISCIPLINE_APPEALS_PATH,
  DisciplineModuleNav,
} from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineAppealsReviewPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Disciplina' },
        { label: 'Apelaciones', to: portalPathForSession(DISCIPLINE_APPEALS_PATH) },
        { label: APPEAL_REVIEW_COPY.title },
      ]}
      icon={ClipboardList}
      subtitle={APPEAL_REVIEW_COPY.subtitle}
      title={APPEAL_REVIEW_COPY.title}
    />
    <DisciplineModuleNav />
    <AppealsReviewPanel />
  </section>
);

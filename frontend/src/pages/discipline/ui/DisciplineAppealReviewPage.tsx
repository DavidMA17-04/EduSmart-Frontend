import { ClipboardList } from 'lucide-react';
import { APPEAL_REVIEW_COPY, AppealReviewDetailPanel, DISCIPLINE_APPEALS_REVIEW_PATH } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineAppealReviewPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Disciplina' },
        { label: APPEAL_REVIEW_COPY.title, to: DISCIPLINE_APPEALS_REVIEW_PATH },
        { label: APPEAL_REVIEW_COPY.detail },
      ]}
      icon={ClipboardList}
      subtitle={APPEAL_REVIEW_COPY.subtitle}
      title={APPEAL_REVIEW_COPY.detail}
    />
    <AppealReviewDetailPanel />
  </section>
);

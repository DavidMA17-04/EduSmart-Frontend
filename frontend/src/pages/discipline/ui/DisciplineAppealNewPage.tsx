import { portalPathForSession } from '@/shared/auth/portalPaths';
import { Scale } from 'lucide-react';
import { APPEAL_CENTER_COPY, AppealWizardPanel, DISCIPLINE_APPEALS_PATH } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineAppealNewPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Disciplina' },
        { label: APPEAL_CENTER_COPY.title, to: portalPathForSession(DISCIPLINE_APPEALS_PATH) },
        { label: APPEAL_CENTER_COPY.newAppeal },
      ]}
      icon={Scale}
      subtitle="Seleccione un expediente AM- elegible y presente el recurso con el mismo contrato de Disciplina."
      title={APPEAL_CENTER_COPY.newAppeal}
    />
    <AppealWizardPanel />
  </section>
);

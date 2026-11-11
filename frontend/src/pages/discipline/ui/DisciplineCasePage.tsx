import { Inbox } from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  CaseDetailPanel,
  DisciplineModuleNav,
  DISCIPLINE_CASES_PATH,
} from '@/features/manage-discipline';
import { portalPathForSession } from '@/shared/auth/portalPaths';
import { PageHeader } from '@/shared/ui';
import { useRoleAudience } from '@/widgets/app-shell';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineCasePage = () => {
  const params = useParams();
  const caseId = Number(params.caseId);
  const audience = useRoleAudience();
  const staff = audience !== 'student' && audience !== 'guardian';

  return (
    <section className={styles.page}>
      <PageHeader
        breadcrumbs={[
          { label: 'Disciplina' },
          { label: 'Expedientes', to: portalPathForSession(DISCIPLINE_CASES_PATH) },
          { label: 'Detalle' },
        ]}
        icon={Inbox}
        subtitle="El sistema le indica el paso del debido proceso y la acción principal. Hechos, cronología y seguimiento quedan a un clic."
        title="Expediente"
      />
      {staff ? <DisciplineModuleNav /> : null}
      {Number.isInteger(caseId) && caseId > 0 ? <CaseDetailPanel caseId={caseId} /> : null}
    </section>
  );
};

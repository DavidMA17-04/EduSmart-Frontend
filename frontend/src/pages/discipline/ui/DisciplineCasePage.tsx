import { Inbox } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { CaseDetailPanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineCasePage = () => {
  const params = useParams();
  const caseId = Number(params.caseId);
  return (
    <section className={styles.page}>
      <PageHeader
        breadcrumbs={[{ label: 'Disciplina' }, { label: 'Expedientes' }, { label: 'Detalle' }]}
        icon={Inbox}
        subtitle="Arriba va el paso del expediente. Los hechos, el trámite y la cronología están separados."
        title="Expediente"
      />
      {Number.isInteger(caseId) && caseId > 0 ? <CaseDetailPanel caseId={caseId} /> : null}
    </section>
  );
};

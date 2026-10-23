import { Inbox } from 'lucide-react';
import { CaseInboxPanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineCasesPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Expedientes' }]}
      icon={Inbox}
        subtitle="Cada expediente muestra en qué paso va, quién actúa y el plazo. Abra uno para continuar."
      title="Expedientes"
    />
    <CaseInboxPanel />
  </section>
);

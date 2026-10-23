import { ClipboardPen } from 'lucide-react';
import { RegisterCasePanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineRegisterPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Registrar amonestación' }]}
      icon={ClipboardPen}
      subtitle="Elija la falta y el formulario le dice si sigue por amonestación directa o por debido proceso."
      title="Registrar amonestación"
    />
    <RegisterCasePanel />
  </section>
);

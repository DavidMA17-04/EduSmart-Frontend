import { ClipboardPen } from 'lucide-react';
import { DisciplineModuleNav, RegisterCasePanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineRegisterPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Registrar amonestación' }]}
      icon={ClipboardPen}
      subtitle="Empiece por el estudiante y la falta. El resto del formulario se adapta solo."
      title="Registrar amonestación"
    />
    <DisciplineModuleNav />
    <RegisterCasePanel />
  </section>
);

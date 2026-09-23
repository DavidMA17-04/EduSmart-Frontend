import { GitBranch } from 'lucide-react';
import { AcademicStructureWizard } from '@/widgets/academic-structure-wizard';
import { PageHeader } from '@/shared/ui';
import styles from './AcademicStructureWizardPage.module.css';

export const AcademicStructureWizardPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver al panel', to: '/admin' }}
      breadcrumbs={[
        { label: 'Administrativo' },
        { label: 'Estructura académica', to: '/admin/specialties' },
        { label: 'Configurar ciclo' },
      ]}
      icon={GitBranch}
      subtitle="Asistente guiado: año lectivo → cursos lectivos → niveles → secciones."
      title="Configurar ciclo académico"
    />
    <AcademicStructureWizard />
  </section>
);

import { BookOpen } from 'lucide-react';
import { SubjectsPanel } from '@/widgets/subjects-panel';
import { PageHeader } from '@/shared/ui';
import styles from './SubjectsPage.module.css';

export const SubjectsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver al panel', to: '/admin' }}
      breadcrumbs={[
        { label: 'Administrativo' },
        { label: 'Materias' },
      ]}
      icon={BookOpen}
      subtitle="CRUD de materias regulares. Crea aquí el nombre antes de asignarlas a docentes o tomar asistencia."
      title="Materias"
    />
    <SubjectsPanel />
  </section>
);

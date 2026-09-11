import { BookMarked } from 'lucide-react';
import { TeachingAssignmentsPanel } from '@/widgets/teaching-assignments-panel';
import { PageHeader } from '@/shared/ui';
import styles from './TeachingAssignmentsPage.module.css';

export const TeachingAssignmentsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver a niveles y secciones', to: '/admin/sections-groups' }}
      breadcrumbs={[
        { label: 'Administrativo' },
        { label: 'Asignaciones académicas' },
      ]}
      icon={BookMarked}
      subtitle="Configure qué imparte cada docente (materia, taller o especialidad) por grupo y período. Independiente del docente guía."
      title="Asignaciones académicas"
    />
    <TeachingAssignmentsPanel />
  </section>
);

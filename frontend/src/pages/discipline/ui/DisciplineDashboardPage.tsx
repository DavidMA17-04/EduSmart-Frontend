import { LayoutDashboard } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { DisciplineDashboardPanel, DISCIPLINE_PERMISSIONS } from '@/features/manage-discipline';
import { sessionHasPermission } from '@/shared/auth';
import { PageHeader } from '@/shared/ui';
import { useRoleAudience } from '@/widgets/app-shell';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineDashboardPage = () => {
  const audience = useRoleAudience();
  if (audience === 'guardian' || audience === 'student') {
    return (
      <Navigate
        replace
        to={audience === 'guardian' ? '/guardian/discipline/notifications' : '/student'}
      />
    );
  }

  return (
    <section className={styles.page}>
      <PageHeader
        breadcrumbs={[{ label: 'Disciplina' }, { label: 'Tablero' }]}
        icon={LayoutDashboard}
        subtitle="Totales, plazos y alertas de las secciones a su alcance."
        title="Tablero disciplinario"
      />
      <DisciplineDashboardPanel canExport={sessionHasPermission(DISCIPLINE_PERMISSIONS.export)} />
    </section>
  );
};

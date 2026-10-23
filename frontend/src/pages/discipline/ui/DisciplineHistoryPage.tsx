import { GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { ConductHistoryPanel, DISCIPLINE_PERMISSIONS } from '@/features/manage-discipline';
import { sessionHasPermission } from '@/shared/auth';
import { PageHeader } from '@/shared/ui';
import { useRoleAudience } from '@/widgets/app-shell';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineHistoryPage = () => {
  const audience = useRoleAudience();
  const userId = useAuthStore((state) => state.user?.id ?? 0);
  const historyAudience = audience === 'student' || audience === 'guardian' ? audience : 'staff';

  return (
    <section className={styles.page}>
      <PageHeader
        breadcrumbs={[{ label: 'Disciplina' }, { label: 'Historial' }]}
        icon={GraduationCap}
        subtitle="Nota de conducta por período. El rebajo propuesto no descuenta hasta que el expediente queda firme."
        title={historyAudience === 'student' ? 'Mi conducta' : 'Historial disciplinario'}
      />
      <ConductHistoryPanel
        audience={historyAudience}
        canSearchStudents={historyAudience === 'staff' && sessionHasPermission(DISCIPLINE_PERMISSIONS.create)}
        canExport={sessionHasPermission(DISCIPLINE_PERMISSIONS.export)}
        sessionUserId={userId}
      />
    </section>
  );
};

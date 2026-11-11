import { Navigate } from 'react-router-dom';
import { DisciplineAdminDashboard } from '@/features/manage-discipline';
import { useRoleAudience } from '@/widgets/app-shell';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineHomePage = () => {
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
      <DisciplineAdminDashboard />
    </section>
  );
};

export default DisciplineHomePage;

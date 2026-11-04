import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import { RolesPermissionsPanel } from '@/widgets/roles-permissions-panel';
import styles from './RolesPermissionsPage.module.css';

export const RolesPermissionsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver al Dashboard', to: '/admin' }}
      breadcrumbs={[
        { label: 'Administrativo' },
        { label: 'Roles y permisos' },
      ]}
      icon={ShieldCheck}
      subtitle="Administre los roles disponibles y sus permisos en la plataforma."
      title="Gestión de roles y permisos"
    />
    <RolesPermissionsPanel />
  </section>
);

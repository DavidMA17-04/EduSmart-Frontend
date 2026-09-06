import { Layers } from 'lucide-react';
import { SectionsGroupsPanel } from '@/widgets/sections-groups-panel';
import { PageHeader } from '@/shared/ui';
import styles from './SectionsGroupsPage.module.css';

export const SectionsGroupsPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver a oferta académica', to: '/admin/specialties' }}
      breadcrumbs={[
        { label: 'Administrativo' },
        { label: 'Estructura académica', to: '/admin/specialties' },
        { label: 'Niveles y secciones' },
      ]}
      icon={Layers}
      subtitle="Configure niveles académicos, secciones y docentes guía."
      title="Gestión de niveles y secciones"
    />
    <SectionsGroupsPanel />
  </section>
);

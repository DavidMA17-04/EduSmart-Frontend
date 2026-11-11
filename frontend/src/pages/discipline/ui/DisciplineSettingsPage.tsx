import { Settings } from 'lucide-react';
import {
  DisciplineModuleNav,
  DisciplineSettingsHub,
} from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineSettingsPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Configuración' }]}
      icon={Settings}
      subtitle="Catálogo, calendario, umbrales y guía del debido proceso."
      title="Configuración de Disciplina"
    />
    <DisciplineModuleNav />
    <DisciplineSettingsHub />
  </section>
);

export default DisciplineSettingsPage;

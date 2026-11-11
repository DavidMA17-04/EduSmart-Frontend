import { portalPathForSession } from '@/shared/auth/portalPaths';
import { ShieldAlert } from 'lucide-react';
import {
  DISCIPLINE_SETTINGS_PATH,
  DisciplineModuleNav,
  InfractionCatalogPanel,
} from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineCatalogPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Disciplina' },
        { label: 'Configuración', to: portalPathForSession(DISCIPLINE_SETTINGS_PATH) },
        { label: 'Catálogo de faltas' },
      ]}
      icon={ShieldAlert}
      subtitle="Defina tipos de falta REAC 2026: gravedad, rebajo y vía procesal."
      title="Catálogo de faltas"
    />
    <DisciplineModuleNav />
    <InfractionCatalogPanel />
  </section>
);

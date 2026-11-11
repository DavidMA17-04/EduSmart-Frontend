import { portalPathForSession } from '@/shared/auth/portalPaths';
import { Gavel } from 'lucide-react';
import {
  DISCIPLINE_SETTINGS_PATH,
  DisciplineModuleNav,
  DueProcessFlowPanel,
} from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineProcessPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[
        { label: 'Disciplina' },
        { label: 'Configuración', to: portalPathForSession(DISCIPLINE_SETTINGS_PATH) },
        { label: 'Flujo del debido proceso' },
      ]}
      icon={Gavel}
      subtitle="Guía visual REAC 2026: pasos, responsables, plazos y garantías."
      title="Flujo del debido proceso"
    />
    <DisciplineModuleNav />
    <DueProcessFlowPanel />
  </section>
);

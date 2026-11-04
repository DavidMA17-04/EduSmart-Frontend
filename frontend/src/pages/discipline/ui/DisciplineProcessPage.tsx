import { Gavel } from 'lucide-react';
import { DueProcessFlowPanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineProcessPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Flujo del debido proceso' }]}
      icon={Gavel}
      subtitle="Pasos, responsables y plazos según la guía de debido proceso del CTP Hojancha 2026 (REAC 2026)."
      title="Flujo del debido proceso"
    />
    <DueProcessFlowPanel />
  </section>
);

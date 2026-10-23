import { ShieldAlert } from 'lucide-react';
import { InfractionCatalogPanel } from '@/features/manage-discipline';
import { PageHeader } from '@/shared/ui';
import styles from './DisciplineCatalogPage.module.css';

export const DisciplineCatalogPage = () => (
  <section className={styles.page}>
    <PageHeader
      breadcrumbs={[{ label: 'Disciplina' }, { label: 'Catálogo de faltas' }]}
      icon={ShieldAlert}
      subtitle="Tipos de falta según el REAC 2026, con su gravedad, rebajo fijo y vía procesal."
      title="Catálogo de faltas"
    />
    <InfractionCatalogPanel />
  </section>
);

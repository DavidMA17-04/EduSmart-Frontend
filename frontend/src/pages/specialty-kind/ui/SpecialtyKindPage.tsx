import { Layers, Wrench } from 'lucide-react';
import type { SpecialtyKind } from '@/entities/specialty';
import { SpecialtiesPanel } from '@/widgets/specialties-panel';
import { PageHeader } from '@/shared/ui';
import styles from '../../specialties/ui/SpecialtiesPage.module.css';

interface SpecialtyKindPageProps {
  kind: SpecialtyKind;
}

const META: Record<
  SpecialtyKind,
  { crumb: string; title: string; description: string; Icon: typeof Layers }
> = {
  EXPLORATORY_WORKSHOP: {
    crumb: 'Talleres exploratorios',
    title: 'Talleres exploratorios',
    description: 'Gestión de talleres para séptimo, octavo y noveno.',
    Icon: Layers,
  },
  TECHNICAL_SPECIALTY: {
    crumb: 'Especialidades técnicas',
    title: 'Especialidades técnicas',
    description: 'Gestión de especialidades para décimo, undécimo y duodécimo.',
    Icon: Wrench,
  },
};

export const SpecialtyKindPage = ({ kind }: SpecialtyKindPageProps) => {
  const meta = META[kind];
  const Icon = meta.Icon;

  return (
    <section className={styles.page}>
      <PageHeader
        back={{ label: 'Volver al hub', to: '/admin/specialties' }}
        breadcrumbs={[
          { label: 'Administrativo' },
          { label: 'Estructura académica' },
          { label: 'Oferta académica', to: '/admin/specialties' },
          { label: meta.crumb },
        ]}
        icon={Icon}
        subtitle={meta.description}
        title={meta.title}
      />
      <SpecialtiesPanel kind={kind} />
    </section>
  );
};

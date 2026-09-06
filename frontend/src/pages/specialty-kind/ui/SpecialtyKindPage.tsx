import { ArrowLeft, Layers, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SpecialtyKind } from '@/entities/specialty';
import { SpecialtiesPanel } from '@/widgets/specialties-panel';
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
      <p className={styles.breadcrumb}>
        Administrativo <span>›</span> Estructura académica <span>›</span>{' '}
        <Link className={styles.crumbLink} to="/admin/specialties">
          Oferta académica
        </Link>{' '}
        <span>›</span> {meta.crumb}
      </p>
      <header className={styles.header}>
        <span className={styles.icon}>
          <Icon size={22} />
        </span>
        <div>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
        <Link className={styles.backLink} to="/admin/specialties">
          <ArrowLeft size={16} />
          Volver al hub
        </Link>
      </header>
      <SpecialtiesPanel kind={kind} />
    </section>
  );
};

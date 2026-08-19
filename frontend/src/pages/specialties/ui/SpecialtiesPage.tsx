import { GraduationCap } from 'lucide-react';
import { SpecialtiesPanel } from '@/widgets/specialties-panel';
import styles from './SpecialtiesPage.module.css';

export const SpecialtiesPage = () => <section className={styles.page}>
  <p className={styles.breadcrumb}>Administrativo <span>›</span> Estructura académica <span>›</span> Especialidades académicas</p>
  <header className={styles.header}><span className={styles.icon}><GraduationCap size={22} /></span><div><h1>Gestión de especialidades académicas</h1><p>Configuración de la oferta académica institucional.</p></div></header>
  <SpecialtiesPanel />
</section>;

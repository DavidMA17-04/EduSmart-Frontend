import { Layers } from 'lucide-react';
import { SectionsGroupsPanel } from '@/widgets/sections-groups-panel';
import styles from './SectionsGroupsPage.module.css';

export const SectionsGroupsPage = () => (
  <section className={styles.page}>
    <p className={styles.breadcrumb}>
      Administrativo <span>›</span> Estructura académica <span>›</span> Niveles y secciones
    </p>
    <header className={styles.header}>
      <span className={styles.icon}>
        <Layers size={22} />
      </span>
      <div>
        <h1>Gestión de niveles y secciones</h1>
        <p>Configure niveles académicos, secciones y docentes guía.</p>
      </div>
    </header>
    <SectionsGroupsPanel />
  </section>
);

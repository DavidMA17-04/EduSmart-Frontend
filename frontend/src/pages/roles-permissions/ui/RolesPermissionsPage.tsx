import { ShieldCheck } from 'lucide-react';
import { RolesPermissionsPanel } from '@/widgets/roles-permissions-panel';
import styles from './RolesPermissionsPage.module.css';

export const RolesPermissionsPage = () => <section className={styles.page}>
  <p className={styles.breadcrumb}>Administrativo <span>›</span> Roles y permisos</p>
  <header className={styles.header}><span className={styles.icon}><ShieldCheck size={22} /></span><div><h1>Gestión de roles y permisos</h1><p>Administre los roles disponibles y sus permisos en la plataforma.</p></div></header>
  <RolesPermissionsPanel />
</section>;

import { KeyRound } from 'lucide-react';
import { AttendanceRedeemPanel } from '@/widgets/attendance-redeem-panel';
import { PageHeader } from '@/shared/ui';
import styles from './AttendanceRedeemPage.module.css';

export const AttendanceRedeemPage = () => (
  <section className={styles.page}>
    <PageHeader
      back={{ label: 'Volver al panel', to: '/admin' }}
      breadcrumbs={[{ label: 'Ingresar código' }]}
      icon={KeyRound}
      subtitle="Escribe el código de la clase para marcar tu asistencia (solo estudiantes)."
      title="Ingresar código de asistencia"
    />
    <AttendanceRedeemPanel />
  </section>
);

import { AttendanceHubPanel } from '@/widgets/attendance-hub-panel';
import styles from './AttendanceHomePage.module.css';

export const AttendanceHomePage = () => (
  <section className={styles.page}>
    <AttendanceHubPanel />
  </section>
);

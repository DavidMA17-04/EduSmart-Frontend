import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useUserImport } from '@/hooks/useUserImport';
import {
  MethodSelector,
  FileDropzone,
  ImportPreviewTable
} from '@/components/user-onboarding';
import styles from './UserOnboardingPage.module.css';

export const UserOnboardingPage: React.FC = () => {
  const { currentStep, resetStore } = useUserImport();

  return (
    <div className={styles.container}>
      {/* Top Stepper Header */}
      <header className={styles.navHeader}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>E</div>
          <div>
            <div className={styles.brandText}>EduSmart</div>
            <div className={styles.brandSub}>CTP Hojancha • Portal Administrativo</div>
          </div>
        </div>

        {/* Dynamic Stepper */}
        <div className={styles.stepper}>
          <div className={`${styles.stepItem} ${currentStep === 'SELECT_METHOD' ? styles.stepActive : styles.stepDone}`}>
            <span className={styles.stepNumber}>1</span>
            <span>Método</span>
          </div>

          <span style={{ color: 'var(--text-muted)' }}>—</span>

          <div className={`${styles.stepItem} ${currentStep === 'UPLOAD_FILE' ? styles.stepActive : (currentStep === 'PREVIEW_DATA' || currentStep === 'COMPLETE' ? styles.stepDone : '')}`}>
            <span className={styles.stepNumber}>2</span>
            <span>Carga Masiva</span>
          </div>

          <span style={{ color: 'var(--text-muted)' }}>—</span>

          <div className={`${styles.stepItem} ${currentStep === 'PREVIEW_DATA' ? styles.stepActive : (currentStep === 'COMPLETE' ? styles.stepDone : '')}`}>
            <span className={styles.stepNumber}>3</span>
            <span>Vista Previa (WF-15)</span>
          </div>
        </div>
      </header>

      {/* Main View Router according to currentStep */}
      <main className={styles.mainContent}>
        {currentStep === 'SELECT_METHOD' && <MethodSelector />}
        {currentStep === 'UPLOAD_FILE' && <FileDropzone />}
        {currentStep === 'PREVIEW_DATA' && <ImportPreviewTable />}
        {currentStep === 'COMPLETE' && (
          <div className={`glass-panel ${styles.successCard}`}>
            <div className={styles.successIcon}>
              <ShieldCheck size={40} />
            </div>
            <h2>¡Importación Masiva Completada!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Los registros han sido procesados y guardados exitosamente en la base de datos del CTP de Hojancha.
            </p>
            <button type="button" className={styles.primaryBtn} onClick={resetStore}>
              Volver al Inicio de Incorporación
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserOnboardingPage;

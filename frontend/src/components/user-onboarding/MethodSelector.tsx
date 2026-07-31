import React from 'react';
import { UserPlus, FileSpreadsheet, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUserImport } from '@/hooks/useUserImport';
import styles from './MethodSelector.module.css';

export const MethodSelector: React.FC = () => {
  const setMethod = useUserImport((state) => state.setMethod);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Método de Incorporación de Usuarios</h2>
        <p className={styles.subtitle}>
          Digitalización y registro unificado para el CTP de Hojancha
        </p>
      </div>

      <div className={styles.grid}>
        {/* Card 1: Registro Manual */}
        <div className={`glass-panel ${styles.card}`} onClick={() => alert('Flujo manual habilitado en Sprint 2')}>
          <div className={styles.iconWrapper}>
            <UserPlus size={28} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Registro Manual Individual</h3>
            <p className={styles.cardDesc}>
              Ideal para incorporar a un estudiante, docente o funcionario de manera individual completando un formulario interactivo.
            </p>
          </div>
          <ul className={styles.featuresList}>
            <li><CheckCircle2 size={16} color="#10b981" /> Formulario guiado paso a paso</li>
            <li><CheckCircle2 size={16} color="#10b981" /> Validación inmediata de cédula</li>
            <li><CheckCircle2 size={16} color="#10b981" /> Asignación directa de rol</li>
          </ul>
          <button type="button" className={styles.actionButton}>
            Iniciar Registro Manual <ArrowRight size={18} />
          </button>
        </div>

        {/* Card 2: Importación Masiva (WF-14 & WF-15) */}
        <div className={`glass-panel ${styles.card}`} onClick={() => setMethod('BULK')}>
          <div className={styles.iconWrapper} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <FileSpreadsheet size={28} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Importación Masiva (Excel / CSV)</h3>
            <p className={styles.cardDesc}>
              Permite cargar múltiples usuarios a la vez mediante plantillas de Excel o archivos CSV con pre-visualización e inspección de errores.
            </p>
          </div>
          <ul className={styles.featuresList}>
            <li><CheckCircle2 size={16} color="#10b981" /> Soporte para archivos .xlsx y .csv</li>
            <li><CheckCircle2 size={16} color="#10b981" /> Detección en tiempo real de correos inválidos</li>
            <li><CheckCircle2 size={16} color="#10b981" /> Edición directa en tabla antes de guardar</li>
          </ul>
          <button type="button" className={styles.actionButton} style={{ background: '#10b981' }}>
            Cargar Archivo Masivo <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileSpreadsheet, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUserImport } from '@/hooks/useUserImport';
import { brandColors } from '@/styles/brandColors';
import styles from './MethodSelector.module.css';

export const MethodSelector: React.FC = () => {
  const setMethod = useUserImport((state) => state.setMethod);
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Método de incorporación de usuarios</h2>
        <p className={styles.subtitle}>
          Digitalización y registro unificado para el CTP de Hojancha
        </p>
      </div>

      <div className={styles.grid}>
        <div className={`glass-panel ${styles.card}`} onClick={() => navigate('/administrative/users/new')}>
          <div className={styles.iconWrapper}>
            <UserPlus size={28} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Registro manual individual</h3>
            <p className={styles.cardDesc}>
              Ideal para incorporar a un estudiante, docente o funcionario de manera individual completando un formulario interactivo.
            </p>
          </div>
          <ul className={styles.featuresList}>
            <li><CheckCircle2 size={16} color={brandColors.green} /> Formulario guiado paso a paso</li>
            <li><CheckCircle2 size={16} color={brandColors.green} /> Validación inmediata de cédula</li>
            <li><CheckCircle2 size={16} color={brandColors.green} /> Asignación directa de rol</li>
          </ul>
          <button type="button" className={styles.actionButton}>
            Iniciar registro manual <ArrowRight size={18} />
          </button>
        </div>

        <div className={`glass-panel ${styles.card}`} onClick={() => setMethod('BULK')}>
          <div
            className={styles.iconWrapper}
            style={{
              background: 'color-mix(in srgb, var(--brand-green) 12%, transparent)',
              color: brandColors.green,
              borderColor: 'color-mix(in srgb, var(--brand-green) 25%, transparent)',
            }}
          >
            <FileSpreadsheet size={28} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Importación masiva (Excel / CSV)</h3>
            <p className={styles.cardDesc}>
              Permite cargar múltiples usuarios a la vez mediante plantillas de Excel o archivos CSV con pre-visualización e inspección de errores.
            </p>
          </div>
          <ul className={styles.featuresList}>
            <li><CheckCircle2 size={16} color={brandColors.green} /> Soporte para archivos .xlsx y .csv</li>
            <li><CheckCircle2 size={16} color={brandColors.green} /> Detección en tiempo real de correos inválidos</li>
            <li><CheckCircle2 size={16} color={brandColors.green} /> Edición directa en tabla antes de guardar</li>
          </ul>
          <button type="button" className={styles.actionButton} style={{ background: brandColors.green }}>
            Cargar archivo masivo <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

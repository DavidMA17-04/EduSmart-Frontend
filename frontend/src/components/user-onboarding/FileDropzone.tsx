import React, { useRef, useState } from 'react';
import { UploadCloud, ArrowLeft, Play, Loader2 } from 'lucide-react';
import { useUserImport } from '@/hooks/useUserImport';
import styles from './FileDropzone.module.css';

export const FileDropzone: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { 
    handleFileUpload, 
    loadMockData, 
    setStep, 
    isProcessingFile 
  } = useUserImport();

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={() => setStep('SELECT_METHOD')}>
          <ArrowLeft size={18} /> Volver a selección de método
        </button>
      </div>

      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dragActive : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          className={styles.hiddenInput}
          onChange={onFileChange}
        />

        <div className={styles.iconCircle}>
          {isProcessingFile ? <Loader2 size={32} className="spin" /> : <UploadCloud size={32} />}
        </div>

        <div>
          <h3 className={styles.dropTitle}>
            {isProcessingFile ? 'Procesando archivo...' : 'Arrastra y suelta tu archivo aquí'}
          </h3>
          <p className={styles.dropSubtitle}>
            Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv) hasta 10MB
          </p>
        </div>

        {!isProcessingFile && (
          <button type="button" className={styles.browseBtn}>
            Seleccionar desde mi equipo
          </button>
        )}
      </div>

      {/* Opción de Simulación de Datos (Mocking) */}
      <div className={styles.mockSection}>
        <div className={styles.mockText}>
          <span className={styles.mockTitle}>¿Deseas probar la interfaz sin cargar un archivo real?</span>
          <span className={styles.mockDesc}>
            Inyecta el dataset sintético con filas válidas e inconsistencias de prueba para verificar el WF-15.
          </span>
        </div>
        <button type="button" className={styles.mockBtn} onClick={loadMockData}>
          <Play size={16} /> Cargar Datos Mock
        </button>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Play,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { userImportApi } from '@/features/manage-user-import';
import styles from './UserBulkImport.module.css';

export const UserBulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    const headers = 'identificacion,nombres,apellidos,correo,rol,seccion,telefono,estado\n';
    const sampleRow = '504120893,Aaron Jose,Solano Mendoza,asolano@ctphojancha.ed.cr,ESTUDIANTE,11-B,87441234,Activo\n';
    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plantilla_Usuarios_EduSmart.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

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
    setErrorMessage(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleValidateFile = async () => {
    if (!selectedFile) {
      setErrorMessage('Por favor seleccione o arrastre un archivo Excel (.xlsx, .xls) o CSV antes de continuar.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await userImportApi.validateFile(selectedFile);
      navigate('/admin/users/import/preview', {
        state: { importData: response, fileName: selectedFile.name },
      });
    } catch (err: any) {
      setErrorMessage(
        err.message || 'No se pudo validar el archivo con el servidor. Verifique que el backend esté activo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Botón de retroceso */}
      <div className={styles.topNavigation}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/admin/users')}
          disabled={isLoading}
        >
          <ArrowLeft size={18} /> Volver a selección de método
        </button>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Importación Masiva de Usuarios</h1>
        <p className={styles.subtitle}>
          Cargue su archivo Excel (.xlsx, .xls) o CSV con el formato estandarizado para registrar usuarios masivamente.
        </p>
      </header>

      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            background: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-border)',
            borderRadius: '12px',
            color: 'var(--status-error-text)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid Principal: Dropzone (Izq) y Checklist/Validación (Der) */}
      <div className={styles.gridContent}>
        {/* Panel 1: Drag & Drop Dropzone */}
        <section className={styles.dropzoneCard}>
          <h2 className={styles.sectionTitle}>
            <UploadCloud size={20} color="var(--color-primary-blue)" />
            1. Seleccionar archivo
          </h2>

          <div
            className={`${styles.dropzoneArea} ${isDragOver ? styles.dropzoneActive : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              style={{ display: 'none' }}
              onChange={onFileChange}
              disabled={isLoading}
            />

            <div className={styles.dropzoneIconCircle}>
              <FileSpreadsheet size={32} />
            </div>

            <div className={styles.dropzoneMainText}>
              Arrastra y suelta tu archivo aquí
            </div>
            <div className={styles.dropzoneSubText}>
              Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv) hasta 10 MB
            </div>

            <button type="button" className={styles.browseBtn} disabled={isLoading}>
              <UploadCloud size={16} />
              Seleccionar desde mi equipo
            </button>
          </div>

          {selectedFile && (
            <div className={styles.fileSelectedBadge}>
              <div className={styles.fileSelectedInfo}>
                <FileCheck size={20} color="var(--color-primary-green)" />
                <div>
                  <div className={styles.fileName}>{selectedFile.name}</div>
                  <div className={styles.fileSize}>
                    {(selectedFile.size / 1024).toFixed(1)} KB • Listo para procesar
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Panel 2: Requisitos y Validación */}
        <aside className={styles.sidePanel}>
          {/* Card Descarga de Plantilla */}
          <div className={styles.downloadCard}>
            <div className={styles.downloadInfo}>
              <FileSpreadsheet size={28} className={styles.downloadIcon} />
              <div>
                <div className={styles.downloadTitle}>Plantilla Oficial EduSmart</div>
                <div className={styles.downloadSub}>Estructura pre-configurada (.xlsx / .csv)</div>
              </div>
            </div>
            <button
              type="button"
              className={styles.downloadBtn}
              onClick={handleDownloadTemplate}
              disabled={isLoading}
            >
              <Download size={15} />
              Descargar
            </button>
          </div>

          {/* Card Checklist de Requisitos */}
          <div className={styles.sideCard}>
            <h3 className={styles.sectionTitle}>
              <CheckCircle2 size={18} color="var(--color-primary-green)" />
              2. Requisitos de importación
            </h3>
            <ul className={styles.checklist}>
              <li className={styles.checklistItem}>
                <CheckCircle2 size={16} color="var(--color-primary-green)" />
                No alterar el nombre de los encabezados.
              </li>
              <li className={styles.checklistItem}>
                <CheckCircle2 size={16} color="var(--color-primary-green)" />
                Cédulas sin guiones ni espacios (9 dígitos).
              </li>
              <li className={styles.checklistItem}>
                <CheckCircle2 size={16} color="var(--color-primary-green)" />
                Correos institucionales (@ctphojancha.ed.cr).
              </li>
              <li className={styles.checklistItem}>
                <CheckCircle2 size={16} color="var(--color-primary-green)" />
                Roles válidos: ESTUDIANTE, DOCENTE, etc.
              </li>
            </ul>
          </div>

          {/* Bloque de Validación y Paso al WF-15 */}
          <div className={styles.validateCard}>
            <button
              type="button"
              className={styles.validateBtn}
              onClick={handleValidateFile}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Validando con el servidor...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Validar y procesar archivo
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Sección 3: Tabla Explicativa con las 8 Columnas Oficiales */}
      <section className={styles.schemaCard}>
        <h2 className={styles.sectionTitle}>
          <AlertCircle size={20} color="var(--color-primary-blue)" />
          3. Estructura requerida del archivo
        </h2>

        <div className={styles.schemaTableWrapper}>
          <table className={styles.schemaTable}>
            <thead>
              <tr>
                <th>Columna</th>
                <th>Obligatorio</th>
                <th>Tipo de Dato</th>
                <th>Valores Permitidos / Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>identificacion*</strong></td>
                <td><span className={styles.badgeRequiredYes}>Sí</span></td>
                <td>Texto / Numérico</td>
                <td>504120893 (9 dígitos exactos)</td>
              </tr>
              <tr>
                <td><strong>nombres*</strong></td>
                <td><span className={styles.badgeRequiredYes}>Sí</span></td>
                <td>Texto (50 chars)</td>
                <td>Aaron José</td>
              </tr>
              <tr>
                <td><strong>apellidos*</strong></td>
                <td><span className={styles.badgeRequiredYes}>Sí</span></td>
                <td>Texto (50 chars)</td>
                <td>Solano Mendoza</td>
              </tr>
              <tr>
                <td><strong>correo*</strong></td>
                <td><span className={styles.badgeRequiredYes}>Sí</span></td>
                <td>Email válido</td>
                <td>asolano@ctphojancha.ed.cr</td>
              </tr>
              <tr>
                <td><strong>rol*</strong></td>
                <td><span className={styles.badgeRequiredYes}>Sí</span></td>
                <td>Enum</td>
                <td>ESTUDIANTE, DOCENTE, ADMINISTRATIVO, DIRECTIVO</td>
              </tr>
              <tr>
                <td><strong>seccion</strong></td>
                <td><span className={styles.badgeRequiredNo}>No</span></td>
                <td>Texto</td>
                <td>10-A, 11-B Informática, Depto. Ciencias</td>
              </tr>
              <tr>
                <td><strong>telefono</strong></td>
                <td><span className={styles.badgeRequiredNo}>No</span></td>
                <td>Texto (15 chars)</td>
                <td>8744-1234</td>
              </tr>
              <tr>
                <td><strong>estado</strong></td>
                <td><span className={styles.badgeRequiredNo}>No</span></td>
                <td>Enum</td>
                <td>Activo, Inactivo, Bloqueado (Por defecto: Activo)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UserBulkImportPage;

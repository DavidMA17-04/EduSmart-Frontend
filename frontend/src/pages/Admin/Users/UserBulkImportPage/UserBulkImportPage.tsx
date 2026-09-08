import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import {
  downloadOfficialTemplateCsv,
  downloadOfficialTemplateXlsx,
} from '@/features/manage-user-import';
import { BulkImportWizardModal } from './BulkImportWizardModal';
import styles from './UserBulkImport.module.css';

export const UserBulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.topNavigation}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft size={18} /> Volver a selección de método
        </button>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Importación Masiva de Usuarios</h1>
        <p className={styles.subtitle}>
          Revise los requisitos y la estructura oficial, descargue la plantilla y luego cargue su
          archivo Excel o CSV en el asistente.
        </p>
      </header>

      <div className={styles.orientationGrid}>
        <aside className={styles.sidePanel}>
          <div className={styles.downloadCard}>
            <div className={styles.downloadInfo}>
              <FileSpreadsheet size={28} className={styles.downloadIcon} />
              <div>
                <div className={styles.downloadTitle}>Plantilla Oficial EduSmart</div>
                <div className={styles.downloadSub}>
                  Estructura pre-configurada (.xlsx / .csv)
                </div>
              </div>
            </div>
            <div className={styles.downloadActions}>
              <button
                type="button"
                className={styles.downloadBtn}
                onClick={downloadOfficialTemplateXlsx}
              >
                <Download size={15} />
                Excel
              </button>
              <button
                type="button"
                className={styles.downloadBtnOutline}
                onClick={downloadOfficialTemplateCsv}
              >
                <Download size={15} />
                CSV
              </button>
            </div>
          </div>

          <div className={styles.sideCard}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle2 size={18} color="var(--color-primary-green)" />
              Requisitos de importación
            </h2>
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
                Roles válidos: únicamente ESTUDIANTE (por defecto si se omite).
              </li>
            </ul>
          </div>

          <div className={styles.ctaCard}>
            <p className={styles.ctaText}>
              Cuando tenga el archivo listo con la plantilla oficial, inicie la carga en el
              asistente.
            </p>
            <button
              type="button"
              className={styles.ctaBtn}
              onClick={() => setIsWizardOpen(true)}
            >
              <Upload size={18} />
              Seleccionar archivo
            </button>
          </div>
        </aside>

        <section className={styles.schemaCard}>
          <h2 className={styles.sectionTitle}>
            <AlertCircle size={20} color="var(--color-primary-blue)" />
            Estructura requerida del archivo
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
                  <td>
                    <strong>identificacion*</strong>
                  </td>
                  <td>
                    <span className={styles.badgeRequiredYes}>Sí</span>
                  </td>
                  <td>Texto / Numérico</td>
                  <td>504120893 (9 dígitos exactos)</td>
                </tr>
                <tr>
                  <td>
                    <strong>nombres*</strong>
                  </td>
                  <td>
                    <span className={styles.badgeRequiredYes}>Sí</span>
                  </td>
                  <td>Texto (50 chars)</td>
                  <td>Aaron José</td>
                </tr>
                <tr>
                  <td>
                    <strong>apellidos*</strong>
                  </td>
                  <td>
                    <span className={styles.badgeRequiredYes}>Sí</span>
                  </td>
                  <td>Texto (50 chars)</td>
                  <td>Solano Mendoza</td>
                </tr>
                <tr>
                  <td>
                    <strong>correo*</strong>
                  </td>
                  <td>
                    <span className={styles.badgeRequiredYes}>Sí</span>
                  </td>
                  <td>Email válido</td>
                  <td>asolano@ctphojancha.ed.cr</td>
                </tr>
                <tr>
                  <td>
                    <strong>rol</strong>
                  </td>
                  <td>
                    <span className={styles.badgeRequiredNo}>No / Por defecto</span>
                  </td>
                  <td>Enum</td>
                  <td>Opcional. Si se omite, se asigna ESTUDIANTE automáticamente</td>
                </tr>
                <tr>
                  <td>
                    <strong>seccion</strong>
                  </td>
                  <td>
                    <span className={styles.badgeRequiredNo}>No</span>
                  </td>
                  <td>Texto</td>
                  <td>10-A, 11-B Informática, Depto. Ciencias</td>
                </tr>
                <tr>
                  <td>
                    <strong>telefono</strong>
                  </td>
                  <td>
                    <span className={styles.badgeRequiredNo}>No</span>
                  </td>
                  <td>Texto (15 chars)</td>
                  <td>8744-1234</td>
                </tr>
                <tr>
                  <td>
                    <strong>estado</strong>
                  </td>
                  <td>
                    <span className={styles.badgeRequiredNo}>No / Por defecto</span>
                  </td>
                  <td>Enum</td>
                  <td>
                    Opcional. Si se omite, se asigna Activo automáticamente (Activo, Inactivo,
                    Bloqueado)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <BulkImportWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onImportSuccess={() => {
          setIsWizardOpen(false);
          navigate('/admin/users');
        }}
      />
    </div>
  );
};

export default UserBulkImportPage;

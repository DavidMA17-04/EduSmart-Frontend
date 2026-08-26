import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  UserPlus,
  CheckCircle2,
  Upload,
  Download,
  Plus,
  HelpCircle,
  History,
  FileCheck,
} from 'lucide-react';
import styles from './UserMethodSelection.module.css';

export const UserMethodSelectionPage: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Incorporación de Usuarios</h1>
        <p className={styles.subtitle}>
          Seleccione el método que desea utilizar para incorporar nuevos usuarios a la plataforma del CTP de Hojancha.
        </p>
      </header>

      {/* Grid de 2 tarjetas simétricas (WF-13) */}
      <section className={styles.cardsGrid}>
        {/* Tarjeta de Importación Masiva (Verde / Recomendado) */}
        <div className={styles.card}>
          <span className={styles.recommendedBadge}>Recomendado</span>
          <div className={styles.iconWrapperGreen}>
            <FileSpreadsheet size={30} />
          </div>
          <h2 className={styles.cardTitle}>
            Importación Masiva desde Archivo (Excel / CSV)
          </h2>
          <p className={styles.cardDesc}>
            Cargue múltiples estudiantes, docentes y funcionarios simultáneamente utilizando la plantilla oficial estandarizada.
          </p>

          <ul className={styles.featuresList}>
            <li>
              <CheckCircle2 size={18} className={styles.checkGreen} />
              Ideal para inicios de curso lectivo y matrículas masivas
            </li>
            <li>
              <CheckCircle2 size={18} className={styles.checkGreen} />
              Validación instantánea de formato de cédula y correos MEP
            </li>
            <li>
              <CheckCircle2 size={18} className={styles.checkGreen} />
              Pre-visualización interactiva y corrección de celdas con error
            </li>
          </ul>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.btnGreen}
              onClick={() => navigate('/admin/users/import/bulk')}
            >
              <Upload size={18} />
              Importar usuarios
            </button>
            <button
              type="button"
              className={styles.btnOutlineGreen}
              onClick={handleDownloadTemplate}
            >
              <Download size={18} />
              Ver guía / Plantilla
            </button>
          </div>
        </div>

        {/* Tarjeta de Registro Manual (Azul) */}
        <div className={styles.card}>
          <div className={styles.iconWrapperBlue}>
            <UserPlus size={30} />
          </div>
          <h2 className={styles.cardTitle}>
            Agregar Usuario Manualmente
          </h2>
          <p className={styles.cardDesc}>
            Registre un usuario de forma individual completando un formulario interactivo con asignación directa de rol y permisos.
          </p>

          <ul className={styles.featuresList}>
            <li>
              <CheckCircle2 size={18} className={styles.checkBlue} />
              Apropiado para traslados extemporáneos y nuevos funcionarios
            </li>
            <li>
              <CheckCircle2 size={18} className={styles.checkBlue} />
              Configuración personalizada de especialidad técnica y grupo
            </li>
            <li>
              <CheckCircle2 size={18} className={styles.checkBlue} />
              Activación inmediata de credenciales institucionales
            </li>
          </ul>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.btnBlue}
              onClick={() => navigate('/admin/users/new')}
            >
              <Plus size={18} />
              Agregar manualmente
            </button>
          </div>
        </div>
      </section>

      {/* Sección Inferior de Apoyo */}
      <section className={styles.bottomGrid}>
        {/* Antes de Importar */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <HelpCircle size={20} color="var(--color-primary-blue)" />
            Antes de importar
          </h3>
          <ul className={styles.infoList}>
            <li className={styles.infoItem}>
              <FileCheck size={16} color="var(--color-primary-green)" />
              Asegúrese de usar la plantilla oficial con encabezados intactos.
            </li>
            <li className={styles.infoItem}>
              <FileCheck size={16} color="var(--color-primary-green)" />
              Formatos soportados: <strong>.xlsx, .xls y .csv</strong> (máximo 10 MB).
            </li>
            <li className={styles.infoItem}>
              <FileCheck size={16} color="var(--color-primary-green)" />
              Las cédulas deben contener 9 dígitos sin guiones ni espacios.
            </li>
          </ul>
        </div>

        {/* Importaciones Recientes */}
        <div className={styles.infoCard}>
          <h3 className={styles.infoCardTitle}>
            <History size={20} color="var(--color-primary-blue)" />
            Importaciones recientes
          </h3>
          <div className={styles.recentImportItem}>
            <div className={styles.recentImportInfo}>
              <span className={styles.recentImportName}>Estudiantes_Seccion_10-B.xlsx</span>
              <span className={styles.recentImportDate}>Hace 2 días • 32 registros</span>
            </div>
            <span className={styles.statusSuccessBadge}>Completado</span>
          </div>
          <div className={styles.recentImportItem}>
            <div className={styles.recentImportInfo}>
              <span className={styles.recentImportName}>Docentes_Especialidades_2026.csv</span>
              <span className={styles.recentImportDate}>15 de Feb, 2026 • 45 registros</span>
            </div>
            <span className={styles.statusSuccessBadge}>Completado</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserMethodSelectionPage;

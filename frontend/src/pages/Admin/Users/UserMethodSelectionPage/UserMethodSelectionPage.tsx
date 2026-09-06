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
  Users,
  Eye,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import styles from './UserMethodSelection.module.css';

interface RecentImportItem {
  id: string;
  name: string;
  date: string;
  status: string;
}

const DEFAULT_RECENT_IMPORTS: RecentImportItem[] = [
  {
    id: 'default-1',
    name: 'Estudiantes_Seccion_10-B.xlsx',
    date: 'Hace 2 días • 32 registros',
    status: 'Completado',
  },
  {
    id: 'default-2',
    name: 'Docentes_Especialidades_2026.csv',
    date: '15 de Feb, 2026 • 45 registros',
    status: 'Completado',
  },
];

export const UserMethodSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const [recentImports] = React.useState<RecentImportItem[]>(() => {
    try {
      const stored = localStorage.getItem('edusmart_recent_imports');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_RECENT_IMPORTS;
  });

  const handleDownloadTemplate = () => {
    const headers = 'identificacion,nombres,apellidos,correo,rol,seccion,telefono,estado\n';
    const sampleRow = '504120893,Aaron Jose,Solano Mendoza,asolano@ctphojancha.ed.cr,ESTUDIANTE,11-B,87441234,Activo\n';
    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plantilla_Usuarios_CTP_Hojancha.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <PageHeader
        back={{ label: 'Volver al Dashboard', to: '/admin' }}
        breadcrumbs={[
          { label: 'Administrativo' },
          { label: 'Usuarios' },
          { label: 'Incorporación' },
        ]}
        icon={Users}
        subtitle="Seleccione el método para incorporar nuevos usuarios a la plataforma del CTP de Hojancha."
        title="Incorporación de Usuarios"
      />

      {/* Grid de tarjetas (WF-13 + WF-18) */}
      <section className={styles.cardsGrid}>
        {/* Tarjeta de Importación Masiva (Verde / Recomendado) */}
        <div className={styles.card}>
          <span className={styles.recommendedBadge}>Recomendado</span>
          <div className={styles.iconWrapperGreen}>
            <FileSpreadsheet size={24} />
          </div>
          <h2 className={styles.cardTitle}>
            Importación Masiva desde Archivo (Excel / CSV)
          </h2>
          <p className={styles.cardDesc}>
            Cargue múltiples estudiantes, docentes y funcionarios simultáneamente utilizando la plantilla oficial estandarizada.
          </p>

          <ul className={styles.featuresList}>
            <li>
              <CheckCircle2 size={16} className={styles.checkGreen} />
              Ideal para inicios de curso lectivo y matrículas masivas
            </li>
            <li>
              <CheckCircle2 size={16} className={styles.checkGreen} />
              Validación instantánea de formato de cédula y correos MEP
            </li>
            <li>
              <CheckCircle2 size={16} className={styles.checkGreen} />
              Pre-visualización interactiva y corrección de celdas con error
            </li>
          </ul>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.btnGreen}
              onClick={() => navigate('/admin/users/import/bulk')}
            >
              <Upload size={16} />
              Importar usuarios
            </button>
            <button
              type="button"
              className={styles.btnOutlineGreen}
              onClick={handleDownloadTemplate}
            >
              <Download size={16} />
              Ver guía / Plantilla
            </button>
          </div>
        </div>

        {/* Tarjeta de Registro Manual (Azul) */}
        <div className={styles.card}>
          <div className={styles.iconWrapperBlue}>
            <UserPlus size={24} />
          </div>
          <h2 className={styles.cardTitle}>
            Agregar Usuario Manualmente
          </h2>
          <p className={styles.cardDesc}>
            Registre un usuario de forma individual completando un formulario interactivo con asignación directa de rol y permisos.
          </p>

          <ul className={styles.featuresList}>
            <li>
              <CheckCircle2 size={16} className={styles.checkBlue} />
              Apropiado para traslados extemporáneos y nuevos funcionarios
            </li>
            <li>
              <CheckCircle2 size={16} className={styles.checkBlue} />
              Configuración personalizada de especialidad técnica y grupo
            </li>
            <li>
              <CheckCircle2 size={16} className={styles.checkBlue} />
              Activación inmediata de credenciales institucionales
            </li>
          </ul>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.btnBlue}
              onClick={() => navigate('/admin/users/new')}
            >
              <Plus size={16} />
              Agregar manualmente
            </button>
          </div>
        </div>

        {/* Tarjeta de Consulta y Edición (WF-18) */}
        <div className={styles.card}>
          <div className={styles.iconWrapperBlue}>
            <Users size={24} />
          </div>
          <h2 className={styles.cardTitle}>
            Consultar y Editar Usuarios
          </h2>
          <p className={styles.cardDesc}>
            Acceda al directorio institucional, consulte la ficha de cada usuario y actualice sus datos con registro de auditoría.
          </p>

          <ul className={styles.featuresList}>
            <li>
              <CheckCircle2 size={16} className={styles.checkBlue} />
              Búsqueda por nombre, cédula, correo o rol
            </li>
            <li>
              <CheckCircle2 size={16} className={styles.checkBlue} />
              Consulta de ficha institucional completa
            </li>
            <li>
              <CheckCircle2 size={16} className={styles.checkBlue} />
              Edición validada con historial de auditoría
            </li>
          </ul>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.btnBlue}
              onClick={() => navigate('/admin/users/directory')}
            >
              <Eye size={16} />
              Abrir directorio
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
          {recentImports.map((item) => (
            <div key={item.id} className={styles.recentImportItem}>
              <div className={styles.recentImportInfo}>
                <span className={styles.recentImportName}>{item.name}</span>
                <span className={styles.recentImportDate}>{item.date}</span>
              </div>
              <span className={styles.statusSuccessBadge}>{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserMethodSelectionPage;

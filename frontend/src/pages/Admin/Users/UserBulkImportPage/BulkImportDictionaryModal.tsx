import React, { useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import styles from './BulkImportDictionary.module.css';

interface BulkImportDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkImportDictionaryModal: React.FC<BulkImportDictionaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-dict-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog}>
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.headerIcon}>
              <FileText size={20} />
            </div>
            <div>
              <h2 id="bulk-dict-title" className={styles.title}>
                Diccionario de Datos y Reglas de Carga
              </h2>
              <p className={styles.subtitle}>
                Requisitos para archivo Excel (.xlsx) o CSV institucional
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.noteBanner}>
            <strong>Nota importante:</strong> Los encabezados de la primera fila deben coincidir
            con exactitud (en minúsculas y sin acentos). Los 4 campos marcados como obligatorios
            son estrictos para generar el expediente digital del estudiante.
          </div>

          <section>
            <div className={styles.sectionHead}>
              <div className={styles.sectionLabel}>
                <span className={`${styles.dot} ${styles.dotGreen}`} />
                <h3>Campos Obligatorios (4)</h3>
              </div>
              <span className={styles.chipYes}>Requeridos para creación</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Columna</th>
                    <th>Obligatorio</th>
                    <th>Ejemplo / Regla de Validación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.mono}>identificacion*</td>
                    <td>
                      <span className={styles.badgeYes}>Sí</span>
                    </td>
                    <td>9 dígitos exactos sin guiones (ej. 504120893)</td>
                  </tr>
                  <tr>
                    <td className={styles.mono}>nombres*</td>
                    <td>
                      <span className={styles.badgeYes}>Sí</span>
                    </td>
                    <td>Nombre de pila completo (ej. Aaron José)</td>
                  </tr>
                  <tr>
                    <td className={styles.mono}>apellidos*</td>
                    <td>
                      <span className={styles.badgeYes}>Sí</span>
                    </td>
                    <td>Primer y segundo apellido (ej. Solano Mendoza)</td>
                  </tr>
                  <tr>
                    <td className={styles.mono}>correo*</td>
                    <td>
                      <span className={styles.badgeYes}>Sí</span>
                    </td>
                    <td>Dominio institucional (@ctphojancha.ed.cr)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className={styles.sectionHead}>
              <div className={styles.sectionLabel}>
                <span className={`${styles.dot} ${styles.dotAmber}`} />
                <h3>Campos Opcionales con Valores por Defecto (4)</h3>
              </div>
              <span className={styles.chipOptional}>Opcional</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Columna</th>
                    <th>Obligatorio</th>
                    <th>Valores Permitidos / Comportamiento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.mono}>rol</td>
                    <td>
                      <span className={styles.badgeNo}>No</span>
                    </td>
                    <td>
                      Por defecto asigna <strong>ESTUDIANTE</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.mono}>seccion</td>
                    <td>
                      <span className={styles.badgeNo}>No</span>
                    </td>
                    <td>Ejemplo: 10-A, 11-B Informática</td>
                  </tr>
                  <tr>
                    <td className={styles.mono}>telefono</td>
                    <td>
                      <span className={styles.badgeNo}>No</span>
                    </td>
                    <td>Contacto (ej. 8744-1234)</td>
                  </tr>
                  <tr>
                    <td className={styles.mono}>estado</td>
                    <td>
                      <span className={styles.badgeNo}>No</span>
                    </td>
                    <td>
                      <strong>Activo</strong>, Inactivo o Bloqueado (por defecto: Activo)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <span className={styles.footerHint}>Plantilla oficial EduSmart · 8 columnas</span>
          <button type="button" className={styles.footerClose} onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

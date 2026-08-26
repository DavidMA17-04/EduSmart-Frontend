import { AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import type { ImportResult } from '@/entities/user-import';
import styles from './ImportResultPanel.module.css';

interface ImportResultPanelProps {
  result: ImportResult;
  onReset: () => void;
}

export const ImportResultPanel = ({ result, onReset }: ImportResultPanelProps) => {
  const { summary, successfulRecords, errorRecords } = result;

  return (
    <section className={styles.panel}>
      <header className={`glass-panel ${styles.header}`}>
        <div className={styles.fileInfo}>
          <span className={styles.fileIcon}><FileSpreadsheet size={24} /></span>
          <div>
            <h2>Resultado de la importación</h2>
            <p>Resumen de registros procesados. El detalle proviene del contrato de importación, no del archivo Excel.</p>
          </div>
        </div>
        <div className={styles.metrics}>
          <span className={styles.metric}>Total: {summary.totalRecords}</span>
          <span className={`${styles.metric} ${styles.success}`}>
            <CheckCircle2 size={16} /> Exitosos: {summary.successfulRecords}
          </span>
          <span className={`${styles.metric} ${styles.danger}`}>
            <AlertCircle size={16} /> Con errores: {summary.errorRecords}
          </span>
        </div>
      </header>

      <article className={`glass-panel ${styles.section}`}>
        <h3>Registros exitosos</h3>
        {successfulRecords.length === 0 ? (
          <p className={styles.empty}>No hay registros procesados correctamente.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {successfulRecords.map((record) => (
                  <tr key={`${record.rowNumber}-${record.nationalId ?? record.email ?? record.userId ?? ''}`}>
                    <td>{record.rowNumber}</td>
                    <td>{record.nationalId ?? '—'}</td>
                    <td>{[record.firstName, record.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td>{record.email ?? '—'}</td>
                    <td>{record.role ?? '—'}</td>
                    <td><span className={styles.okChip}>Correcto</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className={`glass-panel ${styles.section}`}>
        <h3>Registros con errores</h3>
        {errorRecords.length === 0 ? (
          <p className={styles.empty}>No se reportaron errores en esta importación.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Campo</th>
                  <th>Datos</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {errorRecords.map((record, index) => (
                  <tr key={`${record.rowNumber}-${record.field ?? 'row'}-${index}`}>
                    <td>{record.rowNumber}</td>
                    <td>{record.field ?? '—'}</td>
                    <td>{formatImportedData(record.data)}</td>
                    <td><span className={styles.errorChip}>{record.message}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} onClick={onReset}>
          Volver al inicio de incorporación
        </button>
      </div>
    </section>
  );
};

function formatImportedData(data?: Record<string, string | undefined>): string {
  if (!data) return '—';
  const values = Object.entries(data)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`);
  return values.length ? values.join(' · ') : '—';
}

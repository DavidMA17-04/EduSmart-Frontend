import { History } from 'lucide-react';
import type { UserAuditLog } from '@/entities/user';
import { Alert, Card } from '@/shared/ui';
import styles from './UserAuditPanel.module.css';

interface UserAuditPanelProps {
  logs: UserAuditLog[];
  isLoading?: boolean;
  error?: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  USER_UPDATED: 'Usuario actualizado',
};

function summarizeChanges(log: UserAuditLog): string {
  if (!log.before || !log.after) return 'Cambio registrado en la ficha.';

  const fields: Array<{ key: string; label: string }> = [
    { key: 'nationalId', label: 'Cédula' },
    { key: 'email', label: 'Correo' },
    { key: 'name', label: 'Nombre' },
    { key: 'firstName', label: 'Nombre' },
    { key: 'lastName', label: 'Apellidos' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'status', label: 'Estado' },
  ];

  const changed = fields
    .filter(({ key }) => {
      const beforeVal = log.before?.[key];
      const afterVal = log.after?.[key];
      return beforeVal !== undefined && afterVal !== undefined && beforeVal !== afterVal;
    })
    .map(({ label }) => label);

  if (changed.length === 0) {
    const beforeRoles = JSON.stringify(log.before.roles ?? []);
    const afterRoles = JSON.stringify(log.after.roles ?? []);
    if (beforeRoles !== afterRoles) return 'Se modificaron los roles asignados.';
    return 'Actualización de datos institucionales.';
  }

  return `Campos modificados: ${changed.join(', ')}.`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export const UserAuditPanel = ({ logs, isLoading = false, error }: UserAuditPanelProps) => (
  <Card className={styles.panel} padded={false}>
    <div className={styles.header}>
      <History size={16} />
      <h2>Historial de auditoría</h2>
    </div>
    <div className={styles.body}>
      {isLoading && <p className={styles.muted}>Cargando historial…</p>}
      {error && <Alert>{error}</Alert>}
      {!isLoading && !error && logs.length === 0 && (
        <p className={styles.muted}>Aún no hay registros de auditoría para este usuario.</p>
      )}
      {!isLoading && !error && logs.length > 0 && (
        <ul className={styles.list}>
          {logs.map((log) => (
            <li key={log.id} className={styles.item}>
              <div className={styles.itemTop}>
                <strong>{ACTION_LABELS[log.action] ?? log.action}</strong>
                <time dateTime={log.createdAt}>{formatDate(log.createdAt)}</time>
              </div>
              <p>{summarizeChanges(log)}</p>
              <small>
                {log.actorId ? `Administrador #${log.actorId}` : 'Sistema'}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  </Card>
);

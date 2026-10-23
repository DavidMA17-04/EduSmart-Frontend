import { Alert, Button, Select, Table } from '@/shared/ui';
import type { GroupEnrollmentListItem } from '../model/types';
import styles from './GroupEnrollmentPanel.module.css';

function fullName(item: GroupEnrollmentListItem): string {
  const parts = [
    item.user.name,
    item.user.firstLastname,
    item.user.secondLastname,
  ].filter(Boolean);
  return parts.join(' ');
}

type Props = {
  enrollments: GroupEnrollmentListItem[];
  isLoading: boolean;
  emptyHint?: string;
};

export function GroupEnrollmentList({
  enrollments,
  isLoading,
  emptyHint = 'No hay estudiantes matriculados en esta sección.',
}: Props) {
  if (isLoading) {
    return <p className={styles.muted}>Cargando matrícula…</p>;
  }

  if (enrollments.length === 0) {
    return <p className={styles.muted}>{emptyHint}</p>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Estudiante</th>
          <th>Cédula</th>
          <th>Desde</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {enrollments.map((row) => (
          <tr key={row.id}>
            <td>
              <strong>{fullName(row)}</strong>
            </td>
            <td>{row.user.nationalId}</td>
            <td>{row.startsOn}</td>
            <td>{row.status === 'ACTIVE' ? 'Activa' : 'Finalizada'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

type FormProps = {
  availableStudents: Array<{
    id: number;
    name: string;
    nationalId?: string | null;
  }>;
  userId: string;
  startsOn: string;
  fieldErrors: Partial<Record<'userId' | 'startsOn', string>>;
  formError: string | null;
  isSubmitting: boolean;
  onChange: (patch: { userId?: string; startsOn?: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function EnrollStudentForm({
  availableStudents,
  userId,
  startsOn,
  fieldErrors,
  formError,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}: FormProps) {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {formError && <Alert>{formError}</Alert>}
      <label>
        Estudiante
        <Select
          onChange={(event) => onChange({ userId: event.target.value })}
          value={userId}
        >
          <option value="">Seleccione…</option>
          {availableStudents.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
              {student.nationalId ? ` (${student.nationalId})` : ''}
            </option>
          ))}
        </Select>
        {fieldErrors.userId && (
          <span className={styles.error}>{fieldErrors.userId}</span>
        )}
      </label>
      <label>
        Fecha de inicio
        <input
          className={styles.dateInput}
          onChange={(event) => onChange({ startsOn: event.target.value })}
          type="date"
          value={startsOn}
        />
        {fieldErrors.startsOn && (
          <span className={styles.error}>{fieldErrors.startsOn}</span>
        )}
      </label>
      <div className={styles.formActions}>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando…' : 'Matricular'}
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          Cancelar
        </Button>
      </div>
      {availableStudents.length === 0 && (
        <p className={styles.muted}>
          No hay estudiantes ACTIVE disponibles para matricular (o ya están
          en esta sección).
        </p>
      )}
    </form>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Alert, Card, EmptyState } from '@/shared/ui';
import { getSessionUser } from '@/shared/auth';
import { guardianLinkApi } from '../api/guardianLinkApi';
import { guardianLinkErrorMessage, representedStudentsOf } from '../model/guardianLinks';
import styles from './RepresentedStudentsPanel.module.css';

export function RepresentedStudentsPanel() {
  const sessionUserId = getSessionUser()?.id ?? 0;
  const [students, setStudents] = useState<ReturnType<typeof representedStudentsOf>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void guardianLinkApi
      .listMine()
      .then((links) => {
        if (!active) return;
        setStudents(representedStudentsOf(links, sessionUserId));
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(guardianLinkErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionUserId]);

  return (
    <Card>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Users size={16} /> Estudiantes a cargo
        </h2>
        {loading ? <p className={styles.hint}>Cargando representados…</p> : null}
        {error ? <Alert>{error}</Alert> : null}
        {!loading && !error && students.length === 0 ? (
          <EmptyState
            description="Cuando un administrador vincule un estudiante a su cuenta, aparecerá aquí."
            icon={Users}
            title="Sin estudiantes vinculados"
          />
        ) : null}
        {students.length > 0 ? (
          <ul className={styles.list}>
            {students.map((student) => (
              <li className={styles.item} key={student.linkId}>
                <div>
                  <strong className={styles.name}>{student.name || 'Estudiante'}</strong>
                  <span className={styles.meta}>
                    {student.nationalId || 'Sin cédula'}
                    {student.relationship ? ` · ${student.relationship}` : ''}
                  </span>
                </div>
                <div className={styles.actions}>
                  <Link className={styles.link} to="/guardian/attendance">
                    Asistencia
                  </Link>
                  <Link className={styles.link} to="/guardian/discipline">
                    Conducta
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}

import { useEffect, useState } from 'react';
import { IdCard } from 'lucide-react';
import type { AdministrativeUser } from '@/entities/user';
import { Alert, Card, StatusBadge } from '@/shared/ui';
import { HttpError } from '@/shared/api';
import { userApi } from '../api/userApi';
import {
  enrollmentSummary,
  formatRoleNames,
  userHasStudentRole,
  userStatusTone,
} from '../model/ownGeneralInfo';
import styles from './OwnGeneralInfoPanel.module.css';

export function OwnGeneralInfoPanel({
  user,
}: {
  /** Pass the already loaded ficha (settings). Omit to load GET /users/me (homes). */
  user?: AdministrativeUser | null;
}) {
  const [profile, setProfile] = useState<AdministrativeUser | null>(user ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(user === undefined);

  useEffect(() => {
    if (user !== undefined) {
      setProfile(user);
      setError(null);
      setLoading(user === null);
      return;
    }

    let active = true;
    setLoading(true);
    void userApi
      .getMe()
      .then((me) => {
        if (!active) return;
        setProfile(me);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof HttpError ? reason.message : 'No se pudo cargar su información.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const student = userHasStudentRole(profile);

  return (
    <Card>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <IdCard size={16} /> Información general
        </h2>
        {loading ? <p className={styles.hint}>Cargando su ficha…</p> : null}
        {error ? <Alert>{error}</Alert> : null}
        {!loading && !error && profile ? (
          <>
            <dl className={styles.details}>
              <div>
                <dt>Cédula</dt>
                <dd>{profile.nationalId || '—'}</dd>
              </div>
              <div>
                <dt>Nombre</dt>
                <dd>{profile.firstName || profile.name || '—'}</dd>
              </div>
              <div>
                <dt>Apellidos</dt>
                <dd>
                  {[profile.first_lastname, profile.second_lastname].filter(Boolean).join(' ') ||
                    profile.lastName ||
                    '—'}
                </dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{profile.email || '—'}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{profile.phone || '—'}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <StatusBadge tone={userStatusTone(profile.status)} withDot={profile.status === 'ACTIVE'}>
                    {profile.status}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>{formatRoleNames(profile)}</dd>
              </div>
              {profile.department ? (
                <div>
                  <dt>Departamento</dt>
                  <dd>{profile.department.name}</dd>
                </div>
              ) : null}
              {student || profile.enrollment ? (
                <>
                  <div>
                    <dt>Sección</dt>
                    <dd>{enrollmentSummary(profile.enrollment)}</dd>
                  </div>
                  {profile.enrollment?.specialtyName ? (
                    <div>
                      <dt>Especialidad</dt>
                      <dd>{profile.enrollment.specialtyName}</dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
            {student && !profile.enrollment ? (
              <p className={styles.hint}>
                Su ficha institucional está disponible. Aún no tiene matrícula en un curso lectivo
                activo.
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </Card>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, MonitorSmartphone, UserRound } from 'lucide-react';
import { authApi } from '@/features/auth';
import { userApi } from '@/features/manage-user';
import { isValidInitialPassword } from '@/features/manage-user/model/userFormRules';
import type { AdministrativeUser } from '@/entities/user';
import type { AuthSessionView } from '@/features/auth/api/authApi';
import { clearAccessToken } from '@/shared/auth';
import { Alert, Button, Card, Input, PageHeader, Table } from '@/shared/ui';
import styles from './ProfileSettingsPage.module.css';

export const ProfileSettingsPage = () => {
  const [profile, setProfile] = useState<AdministrativeUser | null>(null);
  const [name, setName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [sessions, setSessions] = useState<AuthSessionView[]>([]);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [closingAll, setClosingAll] = useState(false);

  const load = async () => {
    const [me, activeSessions] = await Promise.all([userApi.getMe(), authApi.listSessions()]);
    setProfile(me);
    setName(me.firstName ?? me.name ?? '');
    setFirstLastName(me.first_lastname ?? me.lastName?.split(/\s+/)[0] ?? '');
    setSecondLastName(me.second_lastname ?? me.lastName?.split(/\s+/).slice(1).join(' ') ?? '');
    setPhone(me.phone ?? '');
    setSessions(activeSessions);
  };

  useEffect(() => {
    void load().catch((error: unknown) => {
      setProfileError(error instanceof Error ? error.message : 'No se pudo cargar el perfil.');
    });
  }, []);

  const onSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    setProfileInfo(null);
    if (!name.trim() || !firstLastName.trim()) {
      setProfileError('El nombre y el primer apellido son obligatorios.');
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await userApi.updateMe({
        name: name.trim(),
        first_lastname: firstLastName.trim(),
        second_lastname: secondLastName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setProfile(updated);
      setProfileInfo('Perfil actualizado.');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'No se pudo guardar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    if (!isValidInitialPassword(newPassword)) {
      setPasswordError('La nueva contraseña debe tener entre 8 y 72 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmación no coincide.');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      await authApi.logout();
      window.location.assign('/login');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.');
      setSavingPassword(false);
    }
  };

  const onRevoke = async (id: number) => {
    setSessionsError(null);
    try {
      await authApi.revokeSession(id);
      const remaining = await authApi.listSessions();
      setSessions(remaining);
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : 'No se pudo cerrar la sesión.');
    }
  };

  const onLogoutAll = async () => {
    setSessionsError(null);
    setClosingAll(true);
    try {
      await authApi.logoutAll();
      clearAccessToken();
      window.location.assign('/login');
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : 'No se pudieron cerrar las sesiones.');
      setClosingAll(false);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader
        icon={UserRound}
        subtitle="Consulte y actualice su información, contraseña y sesiones activas."
        title="Mi perfil y seguridad"
      />

      <Card>
        <form className={`${styles.section} ${styles.form}`} onSubmit={onSaveProfile}>
          <h2 className={styles.sectionTitle}>
            <UserRound size={16} /> Información básica
          </h2>
          {profileError ? <Alert>{profileError}</Alert> : null}
          {profileInfo ? <p className={styles.info}>{profileInfo}</p> : null}
          <label>
            Correo institucional
            <Input disabled value={profile?.email ?? ''} />
          </label>
          <label>
            Nombre
            <Input onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
          <label>
            Primer apellido
            <Input onChange={(event) => setFirstLastName(event.target.value)} required value={firstLastName} />
          </label>
          <label>
            Segundo apellido
            <Input onChange={(event) => setSecondLastName(event.target.value)} value={secondLastName} />
          </label>
          <label>
            Teléfono
            <Input onChange={(event) => setPhone(event.target.value)} value={phone} />
          </label>
          <Button disabled={savingProfile} type="submit">
            {savingProfile ? 'Guardando…' : 'Guardar perfil'}
          </Button>
        </form>
      </Card>

      <Card>
        <form className={`${styles.section} ${styles.form}`} onSubmit={onChangePassword}>
          <h2 className={styles.sectionTitle}>
            <KeyRound size={16} /> Cambiar contraseña
          </h2>
          {passwordError ? <Alert>{passwordError}</Alert> : null}
          <label>
            Contraseña actual
            <Input
              autoComplete="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>
          <label>
            Nueva contraseña
            <Input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>
          <label>
            Confirmar nueva contraseña
            <Input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          <Button disabled={savingPassword} type="submit">
            {savingPassword ? 'Actualizando…' : 'Actualizar contraseña'}
          </Button>
        </form>
      </Card>

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MonitorSmartphone size={16} /> Sesiones activas
          </h2>
          {sessionsError ? <Alert>{sessionsError}</Alert> : null}
          <Table>
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>IP</th>
                <th>Inicio</th>
                <th>Último uso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.current ? 'Esta sesión' : (session.userAgent || 'Dispositivo desconocido')}</td>
                  <td>{session.ipAddress || '—'}</td>
                  <td>{new Date(session.createdAt).toLocaleString('es-CR')}</td>
                  <td>{session.lastUsedAt ? new Date(session.lastUsedAt).toLocaleString('es-CR') : '—'}</td>
                  <td>
                    {session.current ? null : (
                      <Button onClick={() => void onRevoke(session.id)} type="button" variant="danger">
                        Cerrar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5}>No hay sesiones activas.</td>
                </tr>
              ) : null}
            </tbody>
          </Table>
          <div className={styles.actions}>
            <Button disabled={closingAll || sessions.length === 0} onClick={() => void onLogoutAll()} type="button" variant="danger">
              {closingAll ? 'Cerrando…' : 'Cerrar todas las sesiones'}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};

import {
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent,
  type FormEvent,
} from 'react';
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  MonitorSmartphone,
  Pencil,
  Shield,
  Stamp,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth';
import { userApi } from '@/features/manage-user';
import { formatRoleNames } from '@/features/manage-user/model/ownGeneralInfo';
import { isValidInitialPassword } from '@/features/manage-user/model/userFormRules';
import type { AdministrativeUser } from '@/entities/user';
import type { AuthSessionView } from '@/features/auth/api/authApi';
import { clearAccessToken, getSessionUser } from '@/shared/auth';
import { runAppEnterTransition } from '@/shared/motion/runAppEnterTransition';
import { Alert, Button, ConfirmDialog, Input } from '@/shared/ui';
import styles from './ProfileSettingsPage.module.css';

const PASSWORD_COPY_BLOCK =
  '[EduSmart · CTP Hojancha] Por seguridad no se permite copiar la contraseña. Escríbala de nuevo.';

function blockPasswordClipboard(event: ClipboardEvent<HTMLInputElement>) {
  event.preventDefault();
  event.clipboardData.setData('text/plain', PASSWORD_COPY_BLOCK);
}

type SettingsSection = 'profile' | 'security' | 'sessions';

const SECTIONS: Array<{
  id: SettingsSection;
  label: string;
  caption: string;
  icon: typeof UserRound;
}> = [
  { id: 'profile', label: 'Identidad', caption: 'Ficha personal', icon: UserRound },
  { id: 'security', label: 'Acceso', caption: 'Contraseña', icon: Shield },
  { id: 'sessions', label: 'Presencia', caption: 'Dispositivos', icon: MonitorSmartphone },
];

function initialsFromProfile(profile: AdministrativeUser | null): string {
  if (!profile) return '—';
  const first = (profile.firstName ?? profile.name ?? '').trim();
  const last = (profile.first_lastname ?? profile.lastName ?? '').trim();
  const value = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return value || first.charAt(0).toUpperCase() || '—';
}

function fullNameFromProfile(profile: AdministrativeUser | null): string {
  if (!profile) return 'Cargando…';
  const parts = [
    profile.firstName ?? profile.name,
    profile.first_lastname,
    profile.second_lastname,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return profile.lastName?.trim() || profile.email || 'Usuario';
}

function shortenUserAgent(agent: string | null | undefined): string {
  if (!agent?.trim()) return 'Dispositivo no identificado';
  const raw = agent.trim();
  if (/Windows/i.test(raw) && /Chrome/i.test(raw)) return 'Chrome · Windows';
  if (/Windows/i.test(raw) && /Edg/i.test(raw)) return 'Edge · Windows';
  if (/Windows/i.test(raw) && /Firefox/i.test(raw)) return 'Firefox · Windows';
  if (/Mac OS/i.test(raw) && /Chrome/i.test(raw)) return 'Chrome · macOS';
  if (/Mac OS/i.test(raw) && /Safari/i.test(raw)) return 'Safari · macOS';
  if (/Android/i.test(raw)) return 'Dispositivo Android';
  if (/iPhone|iPad/i.test(raw)) return 'Dispositivo iOS';
  if (raw.length <= 48) return raw;
  return `${raw.slice(0, 45)}…`;
}

function formatIpAddress(ip: string | null | undefined): string {
  if (!ip?.trim()) return '—';
  const raw = ip.trim();
  if (raw.startsWith('::ffff:')) return raw.slice('::ffff:'.length);
  if (raw === '::1') return '127.0.0.1';
  return raw;
}

function formatSessionWhen(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sortSessions(list: AuthSessionView[]): AuthSessionView[] {
  return [...list].sort((a, b) => {
    if (a.current !== b.current) return a.current ? -1 : 1;
    const aTime = new Date(a.lastUsedAt ?? a.createdAt).getTime();
    const bTime = new Date(b.lastUsedAt ?? b.createdAt).getTime();
    return bTime - aTime;
  });
}

function passwordChecks(password: string) {
  return [
    { key: 'len', label: '8 a 72 caracteres', ok: password.length >= 8 && password.length <= 72 },
    { key: 'upper', label: 'Mayúscula', ok: /[A-ZÁÉÍÓÚÑ]/.test(password) },
    { key: 'lower', label: 'Minúscula', ok: /[a-záéíóúñ]/.test(password) },
    { key: 'num', label: 'Número', ok: /\d/.test(password) },
    { key: 'special', label: 'Símbolo', ok: /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ]/.test(password) },
  ];
}

function statusLabel(status: string | null | undefined, loading: boolean): string {
  if (loading) return '…';
  if (!status) return '—';
  const key = status.trim().toUpperCase();
  if (key === 'ACTIVE' || key === 'ACTIVO') return 'Activo';
  if (key === 'INACTIVE' || key === 'INACTIVO') return 'Inactivo';
  if (key === 'SUSPENDED' || key === 'SUSPENDIDO') return 'Suspendido';
  return status;
}

function profileDraftFrom(profile: AdministrativeUser) {
  return {
    name: (profile.firstName ?? profile.name ?? '').trim(),
    firstLastName: (
      profile.first_lastname ??
      profile.lastName?.split(/\s+/)[0] ??
      ''
    ).trim(),
    secondLastName: (
      profile.second_lastname ??
      profile.lastName?.split(/\s+/).slice(1).join(' ') ??
      ''
    ).trim(),
    phone: (profile.phone ?? '').trim(),
  };
}

function sameProfileDraft(
  draft: ReturnType<typeof profileDraftFrom>,
  name: string,
  firstLastName: string,
  secondLastName: string,
  phone: string,
) {
  return (
    draft.name === name.trim() &&
    draft.firstLastName === firstLastName.trim() &&
    draft.secondLastName === secondLastName.trim() &&
    draft.phone === phone.trim()
  );
}

export const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const passwordPending = Boolean(getSessionUser()?.mustChangePassword);
  const [section, setSection] = useState<SettingsSection>(
    passwordPending ? 'security' : 'profile',
  );
  const [profile, setProfile] = useState<AdministrativeUser | null>(null);
  const [name, setName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [editingPassword, setEditingPassword] = useState(passwordPending);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [sessions, setSessions] = useState<AuthSessionView[]>([]);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [closingAll, setClosingAll] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [confirmCloseAll, setConfirmCloseAll] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<number | null>(null);

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
    void load()
      .catch((error: unknown) => {
        setProfileError(error instanceof Error ? error.message : 'No se pudo cargar el perfil.');
      })
      .finally(() => setLoading(false));
  }, []);

  const onSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    setProfileInfo(null);
    if (!profile) return;
    if (!name.trim() || !firstLastName.trim()) {
      setProfileError('El nombre y el primer apellido son obligatorios.');
      return;
    }

    const baseline = profileDraftFrom(profile);
    if (sameProfileDraft(baseline, name, firstLastName, secondLastName, phone)) {
      setEditingProfile(false);
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
      const next = profileDraftFrom(updated);
      setProfile(updated);
      setName(next.name);
      setFirstLastName(next.firstLastName);
      setSecondLastName(next.secondLastName);
      setPhone(next.phone);
      setEditingProfile(false);
      setProfileInfo('Ficha actualizada.');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'No se pudo guardar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const beginEditProfile = () => {
    if (!profile) return;
    const draft = profileDraftFrom(profile);
    setProfileError(null);
    setProfileInfo(null);
    setName(draft.name);
    setFirstLastName(draft.firstLastName);
    setSecondLastName(draft.secondLastName);
    setPhone(draft.phone);
    setEditingProfile(true);
  };

  const cancelEditProfile = () => {
    setProfileError(null);
    setProfileInfo(null);
    if (!profile) {
      setEditingProfile(false);
      return;
    }
    const draft = profileDraftFrom(profile);
    setName(draft.name);
    setFirstLastName(draft.firstLastName);
    setSecondLastName(draft.secondLastName);
    setPhone(draft.phone);
    setEditingProfile(false);
  };

  const resetPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const beginEditPassword = () => {
    setPasswordError(null);
    resetPasswordFields();
    setEditingPassword(true);
  };

  const cancelEditPassword = () => {
    if (passwordPending) return;
    setPasswordError(null);
    resetPasswordFields();
    setEditingPassword(false);
  };

  const selectSection = (next: SettingsSection) => {
    if (next !== 'profile') {
      if (editingProfile) cancelEditProfile();
      setProfileInfo(null);
    }
    if (next !== 'security' && editingPassword && !passwordPending) {
      cancelEditPassword();
    }
    setSection(next);
  };

  const onChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    if (!isValidInitialPassword(newPassword)) {
      setPasswordError('La nueva contraseña no cumple la política institucional.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmación no coincide.');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      await runAppEnterTransition(async () => {
        await authApi.logout();
        navigate('/login', {
          replace: true,
          state: {
            notice:
              'Contraseña actualizada. Inicie sesión de nuevo con su nueva contraseña.',
          },
        });
      });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.');
      setSavingPassword(false);
    }
  };

  const onRevoke = async (id: number) => {
    setSessionsError(null);
    setRevokingId(id);
    try {
      await authApi.revokeSession(id);
      const remaining = await authApi.listSessions();
      setSessions(remaining);
      setConfirmRevokeId(null);
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : 'No se pudo cerrar la sesión.');
    } finally {
      setRevokingId(null);
    }
  };

  const onLogoutAll = async () => {
    setSessionsError(null);
    setClosingAll(true);
    try {
      await runAppEnterTransition(async () => {
        await authApi.logoutAll();
        clearAccessToken();
        navigate('/login', { replace: true });
      });
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : 'No se pudieron cerrar las sesiones.');
      setClosingAll(false);
      setConfirmCloseAll(false);
    }
  };

  const displayName = useMemo(() => fullNameFromProfile(profile), [profile]);
  const rolesLabel = useMemo(() => formatRoleNames(profile), [profile]);
  const profileDirty = useMemo(() => {
    if (!profile || !editingProfile) return false;
    return !sameProfileDraft(
      profileDraftFrom(profile),
      name,
      firstLastName,
      secondLastName,
      phone,
    );
  }, [profile, editingProfile, name, firstLastName, secondLastName, phone]);
  const checks = passwordChecks(newPassword);
  const orderedSessions = useMemo(() => sortSessions(sessions), [sessions]);
  const otherSessions = useMemo(
    () => orderedSessions.filter((session) => !session.current),
    [orderedSessions],
  );
  const revokeTarget = useMemo(
    () => orderedSessions.find((session) => session.id === confirmRevokeId) ?? null,
    [orderedSessions, confirmRevokeId],
  );
  const active = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];
  const today = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const accountStatus = statusLabel(profile?.status, loading);
  const statusTone =
    accountStatus === 'Activo'
      ? styles.statusOk
      : accountStatus === 'Inactivo' || accountStatus === 'Suspendido'
        ? styles.statusWarn
        : undefined;

  return (
    <section className={styles.page}>
      <header className={styles.letterhead}>
        <div className={styles.letterFrame} aria-hidden="true" />

        <div className={styles.letterTop}>
          <div className={styles.brandBlock}>
            <img
              alt=""
              className={styles.crest}
              src="/brand/ctp-hojancha-logo.jpeg"
            />
            <div>
              <p className={styles.institution}>Colegio Técnico Profesional de Hojancha</p>
              <p className={styles.motto}>Ciencia · Cultura · 1972</p>
            </div>
          </div>
          <div className={styles.letterMeta}>
            <span className={styles.confidential}>Uso interno</span>
            <span>Despacho del administrador</span>
            <strong>{today}</strong>
          </div>
        </div>

        <div className={styles.letterRule} aria-hidden="true" />

        <div className={styles.dossierHead}>
          <div className={styles.plaque}>
            <span aria-hidden="true" className={styles.avatar}>
              {initialsFromProfile(profile)}
            </span>
            <div className={styles.plaqueCopy}>
              <p className={styles.dossierLabel}>
                <Stamp aria-hidden size={14} />
                Ficha de acceso institucional
              </p>
              <h1>{loading ? 'Cargando…' : displayName}</h1>
              <p className={styles.roleLine}>{rolesLabel}</p>
            </div>
          </div>

          <dl className={styles.registry}>
            <div className={styles.registryCap}>
              <dt>Registro</dt>
              <dd>ADM · Acceso</dd>
            </div>
            <div>
              <dt>Cédula</dt>
              <dd>{profile?.nationalId || '—'}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{profile?.email || '—'}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd className={statusTone}>{accountStatus}</dd>
            </div>
            <div>
              <dt>Sesiones</dt>
              <dd>{loading ? '…' : sessions.length}</dd>
            </div>
          </dl>
        </div>
      </header>

      {passwordPending ? (
        <Alert>
          Debe actualizar su contraseña para continuar. Hasta entonces solo
          tendrá acceso a esta ficha; al terminar iniciará sesión de nuevo.
        </Alert>
      ) : null}

      <div className={styles.workspace}>
        <aside className={styles.rail}>
          <div className={styles.railHead}>
            <p className={styles.railLabel}>Expediente</p>
            <p className={styles.railFolio}>Folio digital</p>
          </div>
          <nav aria-label="Secciones de la ficha" className={styles.sideNav}>
            {SECTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === section;
              return (
                <button
                  aria-current={isActive ? 'page' : undefined}
                  className={`${styles.sideItem}${isActive ? ` ${styles.sideItemActive}` : ''}`}
                  key={item.id}
                  onClick={() => selectSection(item.id)}
                  type="button"
                >
                  <span className={styles.sideIcon}>
                    <Icon aria-hidden size={16} />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <em>{item.caption}</em>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className={styles.dossierNote}>
            <p className={styles.noteEyebrow}>Custodia del despacho</p>
            <p>
              Esta cuenta concentra la autoridad administrativa del CTP de
              Hojancha. Trátela como documento oficial: revise identidad,
              acceso y presencia con la misma rigurosidad que un expediente
              físico sobre el escritorio.
            </p>
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.sheetHead}>
            <div>
              <p className={styles.sheetEyebrow}>{active.caption}</p>
              <h2>{active.label}</h2>
            </div>
            <div className={styles.sheetMarkBlock}>
              <span className={styles.sheetMark}>EduSmart · CTP Hojancha</span>
              <span className={styles.sheetRef}>
                {section === 'security'
                  ? 'Protocolo · Acceso'
                  : section === 'sessions'
                    ? 'Registro · Presencia'
                    : 'Ficha · Identidad'}
              </span>
            </div>
          </div>

          {section === 'profile' ? (
            <div className={`${styles.panel} ${styles.identityPanel}`}>
              {profileError ? <Alert>{profileError}</Alert> : null}
              {profileInfo ? (
                <p aria-live="polite" className={styles.success}>
                  {profileInfo}
                </p>
              ) : null}

              <div className={styles.identityBanner}>
                <UserRound aria-hidden size={18} />
                <div>
                  <p className={styles.protocolEyebrow}>Expediente personal</p>
                  <p>
                    Datos de la persona titular de esta cuenta administrativa.
                    La ficha se consulta en modo lectura; solo se abre a
                    edición con autorización explícita.
                  </p>
                </div>
              </div>

              {!editingProfile ? (
                <>
                  <div className={styles.identitySheet}>
                    <div className={styles.identitySheetHead}>
                      <p className={styles.securityCardTitle}>Datos registrados</p>
                      <span className={styles.identityMode}>Solo lectura</span>
                    </div>
                    <dl className={styles.identityGrid}>
                      <div className={styles.identityFull}>
                        <dt>Correo institucional</dt>
                        <dd>{profile?.email || '—'}</dd>
                        <span className={styles.fieldHint}>
                          Asignado por la institución · no editable
                        </span>
                      </div>
                      <div>
                        <dt>Nombre</dt>
                        <dd>{name.trim() || '—'}</dd>
                      </div>
                      <div>
                        <dt>Primer apellido</dt>
                        <dd>{firstLastName.trim() || '—'}</dd>
                      </div>
                      <div>
                        <dt>Segundo apellido</dt>
                        <dd>{secondLastName.trim() || '—'}</dd>
                      </div>
                      <div>
                        <dt>Teléfono</dt>
                        <dd>{phone.trim() || '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className={styles.panelActions}>
                    <p className={styles.actionNote}>
                      Para modificar nombre, apellidos o teléfono, abra la
                      edición de la ficha.
                    </p>
                    <Button
                      disabled={loading || !profile}
                      onClick={beginEditProfile}
                      type="button"
                    >
                      <Pencil aria-hidden size={15} />
                      Editar ficha
                    </Button>
                  </div>
                </>
              ) : (
                <form className={styles.identityEdit} onSubmit={onSaveProfile}>
                  <div className={styles.identitySheet}>
                    <div className={styles.identitySheetHead}>
                      <p className={styles.securityCardTitle}>Edición de ficha</p>
                      <span className={`${styles.identityMode} ${styles.identityModeEdit}`}>
                        En edición
                      </span>
                    </div>

                    <div className={styles.fieldGrid}>
                      <label className={styles.full}>
                        Correo institucional
                        <Input disabled value={profile?.email ?? ''} />
                        <span className={styles.fieldHint}>
                          Asignado por la institución · solo lectura
                        </span>
                      </label>
                      <label>
                        Nombre
                        <Input
                          onChange={(event) => setName(event.target.value)}
                          required
                          value={name}
                        />
                      </label>
                      <label>
                        Primer apellido
                        <Input
                          onChange={(event) => setFirstLastName(event.target.value)}
                          required
                          value={firstLastName}
                        />
                      </label>
                      <label>
                        Segundo apellido
                        <Input
                          onChange={(event) => setSecondLastName(event.target.value)}
                          value={secondLastName}
                        />
                      </label>
                      <label>
                        Teléfono
                        <Input
                          onChange={(event) => setPhone(event.target.value)}
                          value={phone}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.panelActions}>
                    <p className={styles.actionNote}>
                      Los cambios quedan registrados en su ficha institucional.
                    </p>
                    <div className={styles.actionGroup}>
                      <Button
                        disabled={savingProfile}
                        onClick={cancelEditProfile}
                        type="button"
                        variant="secondary"
                      >
                        Cancelar
                      </Button>
                      <Button
                        disabled={savingProfile || loading || !profileDirty}
                        type="submit"
                      >
                        {savingProfile ? 'Guardando…' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {section === 'security' ? (
            <div className={`${styles.panel} ${styles.securityPanel}`}>
              {passwordError ? <Alert>{passwordError}</Alert> : null}

              <div className={styles.protocolBanner}>
                <KeyRound aria-hidden size={18} />
                <div>
                  <p className={styles.protocolEyebrow}>Norma de seguridad</p>
                  <p>
                    La clave protege el despacho digital del colegio. Al
                    confirmar el cambio se cerrará esta sesión y deberá
                    autenticarse de nuevo con la nueva contraseña.
                  </p>
                </div>
              </div>

              {!editingPassword ? (
                <>
                  <div className={styles.securityLayout}>
                    <div className={styles.securityCard}>
                      <div className={styles.identitySheetHead}>
                        <p className={styles.securityCardTitle}>Credenciales</p>
                        <span className={styles.identityMode}>Solo lectura</span>
                      </div>
                      <dl className={styles.passwordSummary}>
                        <div>
                          <dt>Estado del acceso</dt>
                          <dd>Protegido con contraseña institucional</dd>
                        </div>
                        <div>
                          <dt>Última acción</dt>
                          <dd>Sin cambio pendiente en esta sesión</dd>
                        </div>
                      </dl>
                    </div>

                    <aside className={styles.requirements} aria-label="Política de contraseña">
                      <div className={styles.reqHead}>
                        <Shield aria-hidden size={16} />
                        <strong>Política institucional</strong>
                      </div>
                      <p className={styles.reqLead}>
                        Requisitos mínimos para cuentas con privilegios
                        administrativos.
                      </p>
                      <ul>
                        {checks.map((check) => (
                          <li className={styles.reqListed} key={check.key}>
                            <span aria-hidden="true" className={styles.reqCheck}>
                              <Check size={12} strokeWidth={3} />
                            </span>
                            {check.label}
                          </li>
                        ))}
                      </ul>
                    </aside>
                  </div>

                  <div className={styles.panelActions}>
                    <p className={styles.actionNote}>
                      Para renovar la clave del despacho, inicie el cambio de
                      forma explícita.
                    </p>
                    <Button onClick={beginEditPassword} type="button">
                      <KeyRound aria-hidden size={15} />
                      Cambiar contraseña
                    </Button>
                  </div>
                </>
              ) : (
                <form className={styles.securityEdit} onSubmit={onChangePassword}>
                  <div className={styles.securityLayout}>
                    <div className={styles.securityCard}>
                      <div className={styles.identitySheetHead}>
                        <p className={styles.securityCardTitle}>Cambio de clave</p>
                        <span
                          className={`${styles.identityMode} ${styles.identityModeEdit}`}
                        >
                          En edición
                        </span>
                      </div>
                      <div className={styles.fieldStack}>
                        <label>
                          Contraseña actual
                          <span className={styles.passwordField}>
                            <Input
                              autoComplete="current-password"
                              onChange={(event) => setCurrentPassword(event.target.value)}
                              onCopy={blockPasswordClipboard}
                              onCut={blockPasswordClipboard}
                              required
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                            />
                            <button
                              aria-label={
                                showCurrentPassword
                                  ? 'Ocultar contraseña actual'
                                  : 'Ver contraseña actual'
                              }
                              className={styles.togglePassword}
                              onClick={() =>
                                setShowCurrentPassword((visible) => !visible)
                              }
                              type="button"
                            >
                              {showCurrentPassword ? (
                                <EyeOff aria-hidden size={16} />
                              ) : (
                                <Eye aria-hidden size={16} />
                              )}
                            </button>
                          </span>
                        </label>
                        <label>
                          Nueva contraseña
                          <span className={styles.passwordField}>
                            <Input
                              autoComplete="new-password"
                              minLength={8}
                              onChange={(event) => setNewPassword(event.target.value)}
                              onCopy={blockPasswordClipboard}
                              onCut={blockPasswordClipboard}
                              required
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                            />
                            <button
                              aria-label={
                                showNewPassword
                                  ? 'Ocultar nueva contraseña'
                                  : 'Ver nueva contraseña'
                              }
                              className={styles.togglePassword}
                              onClick={() => setShowNewPassword((visible) => !visible)}
                              type="button"
                            >
                              {showNewPassword ? (
                                <EyeOff aria-hidden size={16} />
                              ) : (
                                <Eye aria-hidden size={16} />
                              )}
                            </button>
                          </span>
                        </label>
                        <label>
                          Confirmar nueva contraseña
                          <span className={styles.passwordField}>
                            <Input
                              autoComplete="new-password"
                              minLength={8}
                              onChange={(event) => setConfirmPassword(event.target.value)}
                              onCopy={blockPasswordClipboard}
                              onCut={blockPasswordClipboard}
                              required
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                            />
                            <button
                              aria-label={
                                showConfirmPassword
                                  ? 'Ocultar confirmación'
                                  : 'Ver confirmación'
                              }
                              className={styles.togglePassword}
                              onClick={() =>
                                setShowConfirmPassword((visible) => !visible)
                              }
                              type="button"
                            >
                              {showConfirmPassword ? (
                                <EyeOff aria-hidden size={16} />
                              ) : (
                                <Eye aria-hidden size={16} />
                              )}
                            </button>
                          </span>
                        </label>
                      </div>
                    </div>

                    <aside className={styles.requirements} aria-label="Política de contraseña">
                      <div className={styles.reqHead}>
                        <Shield aria-hidden size={16} />
                        <strong>Política institucional</strong>
                      </div>
                      <p className={styles.reqLead}>
                        Marque todos los requisitos con la nueva contraseña
                        antes de confirmar.
                      </p>
                      <ul>
                        {checks.map((check) => (
                          <li
                            className={check.ok ? styles.reqOk : styles.reqPending}
                            key={check.key}
                          >
                            <span
                              aria-hidden="true"
                              className={
                                check.ok ? styles.reqCheck : styles.reqCheckEmpty
                              }
                            >
                              {check.ok ? <Check size={12} strokeWidth={3} /> : null}
                            </span>
                            {check.label}
                          </li>
                        ))}
                      </ul>
                    </aside>
                  </div>

                  <div className={styles.panelActions}>
                    <p className={styles.actionNote}>
                      Se exigirá autenticación inmediata con la nueva clave.
                    </p>
                    <div className={styles.actionGroup}>
                      {!passwordPending ? (
                        <Button
                          disabled={savingPassword}
                          onClick={cancelEditPassword}
                          type="button"
                          variant="secondary"
                        >
                          Cancelar
                        </Button>
                      ) : null}
                      <Button
                        disabled={
                          savingPassword ||
                          !checks.every((check) => check.ok) ||
                          !currentPassword ||
                          newPassword !== confirmPassword
                        }
                        type="submit"
                      >
                        {savingPassword ? 'Actualizando…' : 'Confirmar cambio'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {section === 'sessions' ? (
            <div className={`${styles.panel} ${styles.sessionsPanel}`}>
              <div className={styles.protocolBanner}>
                <MonitorSmartphone aria-hidden size={18} />
                <div>
                  <p className={styles.protocolEyebrow}>Control de presencia</p>
                  <p>
                    Registro de estaciones donde su autoridad administrativa
                    permanece abierta. Si no reconoce un acceso, revóquelo de
                    inmediato.
                  </p>
                </div>
              </div>

              {sessionsError ? <Alert>{sessionsError}</Alert> : null}

              <div className={styles.sessionsSheet}>
                <div className={styles.sessionsSheetHead}>
                  <div>
                    <p className={styles.securityCardTitle}>Sesiones activas</p>
                    <p className={styles.sessionsCount}>
                      {loading
                        ? 'Consultando registro…'
                        : `${orderedSessions.length} ${orderedSessions.length === 1 ? 'estación' : 'estaciones'} · ${otherSessions.length} ${otherSessions.length === 1 ? 'revocable' : 'revocables'}`}
                    </p>
                  </div>
                  <Button
                    disabled={closingAll || loading || sessions.length === 0}
                    onClick={() => setConfirmCloseAll(true)}
                    type="button"
                    variant="danger"
                  >
                    Cerrar todas
                  </Button>
                </div>

                {loading ? (
                  <p className={styles.muted}>Consultando registro…</p>
                ) : orderedSessions.length === 0 ? (
                  <p className={styles.empty}>No hay sesiones activas.</p>
                ) : (
                  <ul className={styles.sessionList}>
                    {orderedSessions.map((session, index) => {
                      const device = shortenUserAgent(session.userAgent);
                      return (
                        <li
                          className={`${styles.sessionRow}${session.current ? ` ${styles.sessionRowCurrent}` : ''}`}
                          key={session.id}
                        >
                          <span aria-hidden="true" className={styles.sessionIndex}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className={styles.sessionCopy}>
                            <strong>
                              {session.current
                                ? `Esta estación · ${device}`
                                : device}
                            </strong>
                            <em>
                              <span>IP {formatIpAddress(session.ipAddress)}</span>
                              <span>Apertura {formatSessionWhen(session.createdAt)}</span>
                              <span>
                                Último uso {formatSessionWhen(session.lastUsedAt)}
                              </span>
                            </em>
                          </span>
                          {session.current ? (
                            <span className={styles.currentBadge}>En uso</span>
                          ) : (
                            <Button
                              disabled={revokingId === session.id || closingAll}
                              onClick={() => setConfirmRevokeId(session.id)}
                              type="button"
                              variant="secondary"
                            >
                              {revokingId === session.id ? 'Revocando…' : 'Revocar'}
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <p className={styles.actionNote}>
                Revocar cierra solo esa estación. Cerrar todas termina también
                esta sesión y lo llevará al inicio de sesión.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        cancelLabel="Mantener"
        confirmLabel={closingAll ? 'Cerrando…' : 'Cerrar todas'}
        icon={MonitorSmartphone}
        isOpen={confirmCloseAll}
        isSubmitting={closingAll}
        message="Se cerrarán todas las estaciones activas, incluida esta. Deberá iniciar sesión de nuevo para continuar en el despacho."
        onCancel={() => {
          if (!closingAll) setConfirmCloseAll(false);
        }}
        onConfirm={() => void onLogoutAll()}
        title="Cerrar todas las sesiones"
        tone="danger"
      />

      <ConfirmDialog
        cancelLabel="Conservar"
        confirmLabel={revokingId != null ? 'Revocando…' : 'Revocar acceso'}
        icon={Shield}
        isOpen={confirmRevokeId != null}
        isSubmitting={revokingId != null}
        message={
          revokeTarget
            ? `Se cerrará el acceso en ${shortenUserAgent(revokeTarget.userAgent)} (IP ${formatIpAddress(revokeTarget.ipAddress)}). Esta estación permanecerá abierta.`
            : 'Se cerrará el acceso en esa estación.'
        }
        onCancel={() => {
          if (revokingId == null) setConfirmRevokeId(null);
        }}
        onConfirm={() => {
          if (confirmRevokeId != null) void onRevoke(confirmRevokeId);
        }}
        title="Revocar sesión"
        tone="danger"
      />
    </section>
  );
};

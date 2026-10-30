import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link2, Unlink } from 'lucide-react';
import type { AdministrativeUser } from '@/entities/user';
import type { Role as CatalogRole } from '@/entities/role';
import { Alert, Button, Card, ConfirmDialog, Input } from '@/shared/ui';
import { sessionHasPermission } from '@/shared/auth';
import { userApi } from '../api/userApi';
import { guardianLinkApi, type GuardianStudentLink } from '../api/guardianLinkApi';
import {
  applyCreatedLink,
  applyRemovedLink,
  canMutateGuardianLinks,
  counterpartOfLink,
  guardianLinkErrorMessage,
  isGuardianRoleName,
  isStudentRoleName,
} from '../model/guardianLinks';
import styles from '../../../pages/user-create/ui/UserPages.module.css';

type PanelKind = 'student' | 'guardian';

export function GuardianLinksPanel({
  userId,
  roleNames,
  roles,
}: {
  userId: number;
  roleNames: string[];
  roles: CatalogRole[];
}) {
  const isStudent = roleNames.some(isStudentRoleName);
  const isGuardian = roleNames.some(isGuardianRoleName);
  const canEdit = canMutateGuardianLinks(sessionHasPermission('administrator.edit'));
  const kinds: PanelKind[] = [
    ...(isStudent ? (['student'] as const) : []),
    ...(isGuardian ? (['guardian'] as const) : []),
  ];

  if (kinds.length === 0) return null;

  return (
    <>
      {kinds.map((kind) => (
        <LinkBlock
          key={kind}
          canEdit={canEdit}
          kind={kind}
          roles={roles}
          userId={userId}
        />
      ))}
    </>
  );
}

function LinkBlock({
  userId,
  kind,
  canEdit,
  roles,
}: {
  userId: number;
  kind: PanelKind;
  canEdit: boolean;
  roles: CatalogRole[];
}) {
  const [links, setLinks] = useState<GuardianStudentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [relationship, setRelationship] = useState('');
  const [hits, setHits] = useState<AdministrativeUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [unlinkId, setUnlinkId] = useState<number | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const counterpartRoleId = useMemo(() => {
    const match = roles.find((role) =>
      kind === 'student' ? isGuardianRoleName(role.name) : isStudentRoleName(role.name),
    );
    return match?.id;
  }, [kind, roles]);

  const load = async () => {
    setIsLoading(true);
    try {
      setLinks(await guardianLinkApi.list(userId));
      setError(null);
    } catch (err) {
      setError(guardianLinkErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const title = kind === 'student' ? 'Encargados' : 'Representados';
  const actionLabel = kind === 'student' ? 'Vincular encargado' : 'Vincular estudiante';
  const searchPlaceholder =
    kind === 'student' ? 'Cédula o nombre del encargado' : 'Cédula o nombre del estudiante';

  const onSearch = async (event: FormEvent) => {
    event.preventDefault();
    const term = search.trim();
    if (!term) return;
    setIsSearching(true);
    setError(null);
    try {
      const page = await userApi.listPaged({
        page: 1,
        limit: 8,
        status: 'ACTIVE',
        search: term,
        roleId: counterpartRoleId,
      });
      const linkedIds = new Set(
        links.map((row) => (kind === 'student' ? row.guardianUserId : row.studentUserId)),
      );
      setHits(page.items.filter((item) => item.id !== userId && !linkedIds.has(item.id)));
    } catch (err) {
      setError(guardianLinkErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  };

  const onLink = async (counterpartUserId: number) => {
    setPendingId(counterpartUserId);
    setError(null);
    try {
      const created = await guardianLinkApi.create(userId, {
        counterpartUserId,
        relationship: relationship.trim() || undefined,
      });
      setLinks((current) => applyCreatedLink(current, created));
      setHits((current) => current.filter((item) => item.id !== counterpartUserId));
      setSearch('');
      setRelationship('');
    } catch (err) {
      setError(guardianLinkErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  const onUnlink = async () => {
    if (unlinkId == null) return;
    setIsUnlinking(true);
    try {
      await guardianLinkApi.remove(unlinkId);
      setLinks((current) => applyRemovedLink(current, unlinkId));
      setUnlinkId(null);
      setError(null);
    } catch (err) {
      setError(guardianLinkErrorMessage(err));
    } finally {
      setIsUnlinking(false);
    }
  };

  const pendingUnlink = links.find((row) => row.id === unlinkId);

  return (
    <Card className={styles.infoCard}>
      <h2>{title}</h2>
      <p>Asocie el acudiente con el estudiante. El portal del encargado usa este vínculo.</p>
      {error ? <Alert>{error}</Alert> : null}
      {isLoading ? <p className={styles.mutedNote}>Cargando vínculos…</p> : null}
      {!isLoading && links.length === 0 ? (
        <p className={styles.mutedNote}>Aún no hay {title.toLowerCase()} ligados.</p>
      ) : null}
      <ul className={styles.linkList}>
        {links.map((row) => {
          const person = counterpartOfLink(row, userId);
          return (
            <li key={row.id}>
              <div>
                <strong>{person.name}</strong>
                <span>
                  {person.nationalId ?? '—'}
                  {row.relationship ? ` · ${row.relationship}` : ''}
                </span>
              </div>
              {canEdit ? (
                <Button onClick={() => setUnlinkId(row.id)} type="button" variant="danger">
                  <Unlink size={14} />
                  Quitar
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {canEdit ? (
        <form className={styles.linkForm} onSubmit={onSearch}>
          <Input
            aria-label={searchPlaceholder}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            value={search}
          />
          <Input
            aria-label="Parentesco"
            maxLength={50}
            onChange={(event) => setRelationship(event.target.value)}
            placeholder="Parentesco (opcional)"
            value={relationship}
          />
          <Button disabled={isSearching || !search.trim()} type="submit" variant="secondary">
            <Link2 size={14} />
            Buscar
          </Button>
        </form>
      ) : null}
      {canEdit && hits.length > 0 ? (
        <ul className={styles.searchHits}>
          {hits.map((hit) => (
            <li key={hit.id}>
              <div>
                <strong>{hit.name ?? hit.email}</strong>
                <span>{hit.nationalId ?? hit.email}</span>
              </div>
              <Button
                disabled={pendingId === hit.id}
                onClick={() => void onLink(hit.id)}
                type="button"
              >
                {actionLabel}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Quitar vínculo"
        isOpen={unlinkId != null}
        isSubmitting={isUnlinking}
        message={
          pendingUnlink
            ? `¿Quitar el vínculo con ${counterpartOfLink(pendingUnlink, userId).name}?`
            : '¿Quitar este vínculo?'
        }
        onCancel={() => setUnlinkId(null)}
        onConfirm={() => void onUnlink()}
        title="Desvincular"
        tone="danger"
      />
    </Card>
  );
}

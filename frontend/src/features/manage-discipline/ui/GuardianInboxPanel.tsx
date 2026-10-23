import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { Alert, Badge, Button, EmptyState, Textarea } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { formatShortDate } from '../model/businessDays';
import { disciplineCasePath } from '../model/disciplineRouting';
import {
  limitDefenseFiles,
  notificationKindLabel,
  notifyDisciplineInboxChanged,
  validateGuardianText,
} from '../model/guardianInbox';
import type { GuardianInbox, GuardianNotification } from '../model/types';
import styles from './GuardianInboxPanel.module.css';

export const GuardianInboxPanel = () => {
  const [inbox, setInbox] = useState<GuardianInbox | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [subsidiary, setSubsidiary] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);

  const load = () => {
    setLoading(true);
    return disciplineApi
      .listMyNotifications()
      .then((next) => {
        setInbox(next);
        setError(null);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No se pudo cargar la bandeja.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  const selected = inbox?.items.find((item) => item.id === selectedId) ?? null;

  const run = async (work: () => Promise<unknown>, success: string) => {
    const problem = validateGuardianText(text);
    if (problem) {
      setError(problem);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await work();
      setNotice(success);
      setText('');
      setFiles([]);
      notifyDisciplineInboxChanged();
      await load();
    } catch (reason) {
      setError(reason instanceof DisciplineApiError ? reason.message : 'No se pudo completar la acción.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.panel}>
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert>{notice}</Alert> : null}
      {loading ? <p className={styles.muted}>Cargando notificaciones…</p> : null}
      {!loading && inbox && inbox.items.length === 0 ? (
        <EmptyState icon={Inbox} title="No hay notificaciones" description="Cuando se comunique un acto de sus representados, aparecerá aquí." />
      ) : null}
      {inbox && inbox.items.length > 0 ? (
        <div className={styles.layout}>
          <ul className={styles.list}>
            {inbox.items.map((item) => (
              <li key={item.id}>
                <button type="button" className={`${item.id === selectedId ? styles.active : styles.item} ${item.readAt ? '' : styles.unread}`} onClick={() => setSelectedId(item.id)}>
                  <strong>{item.studentName}</strong>
                  <span>{notificationKindLabel(item.kind)} · {item.caseNumber}</span>
                  <span>{formatShortDate(item.issuedAt.slice(0, 10))}</span>
                  {item.readAt ? <Badge tone="success">Leída</Badge> : <Badge tone="warning">Sin leer</Badge>}
                </button>
              </li>
            ))}
          </ul>
          {selected ? <Reading key={selected.id} item={selected} text={text} setText={setText} subsidiary={subsidiary} setSubsidiary={setSubsidiary} files={files} setFiles={setFiles} pending={pending} onConfirm={() => {
            setPending(true);
            setError(null);
            void disciplineApi.confirmNotificationRead(selected.id).then((receipt) => {
              setNotice(receipt.label);
              notifyDisciplineInboxChanged();
              return load();
            }).catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : 'No se pudo confirmar la lectura.');
            }).finally(() => setPending(false));
          }} onDefense={() => run(() => disciplineApi.fileDefense(selected.caseId, text.trim(), files), 'Descargo presentado.')} onRevocation={() => run(() => disciplineApi.fileRevocation(selected.caseId, text.trim(), subsidiary), 'Revocatoria presentada.')} onAppeal={() => run(() => disciplineApi.fileAppeal(selected.caseId, text.trim()), 'Apelación presentada.')} /> : (
            <p className={styles.muted}>Seleccione una notificación para leer el acto.</p>
          )}
        </div>
      ) : null}
    </section>
  );
};

function Reading({
  item,
  text,
  setText,
  subsidiary,
  setSubsidiary,
  files,
  setFiles,
  pending,
  onConfirm,
  onDefense,
  onRevocation,
  onAppeal,
}: {
  item: GuardianNotification;
  text: string;
  setText: (value: string) => void;
  subsidiary: boolean;
  setSubsidiary: (value: boolean) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  pending: boolean;
  onConfirm: () => void;
  onDefense: () => void;
  onRevocation: () => void;
  onAppeal: () => void;
}) {
  const [composer, setComposer] = useState<'defense' | 'revocation' | 'appeal' | null>(null);
  const recommended = GUARDIAN_NEXT[item.kind];
  const others = (['defense', 'revocation', 'appeal'] as const).filter((id) => id !== recommended?.id);

  return (
    <article className={styles.reading}>
      <p className={styles.kicker}>{item.caseNumber}</p>
      <h3>{notificationKindLabel(item.kind)}</h3>
      <p>{item.studentName}</p>
      <p className={styles.muted}>Emitido {formatShortDate(item.issuedAt.slice(0, 10))}</p>
      {item.readAt ? <p>{`Leída el ${formatShortDate(item.readAt.slice(0, 10))}`}</p> : (
        <Button type="button" disabled={pending} onClick={onConfirm}>Confirmo lectura</Button>
      )}
      <p><Link to={disciplineCasePath(item.caseId)}>Abrir el expediente</Link></p>
      {recommended ? (
        <div className={styles.next}>
          <strong>{recommended.title}</strong>
          <p>{recommended.help}</p>
          <Button type="button" disabled={pending} onClick={() => setComposer(recommended.id)}>
            {recommended.label}
          </Button>
        </div>
      ) : (
        <p className={styles.muted}>Esta comunicación se lee y se confirma. No pide un escrito nuevo.</p>
      )}
      <details className={styles.more}>
        <summary>Otras respuestas de este expediente</summary>
        <div className={styles.actions}>
          {others.map((id) => (
            <Button key={id} type="button" variant="secondary" disabled={pending} onClick={() => setComposer(id)}>
              {GUARDIAN_CHOICE[id]}
            </Button>
          ))}
        </div>
      </details>
      {composer ? (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (composer === 'defense') onDefense();
            if (composer === 'revocation') onRevocation();
            if (composer === 'appeal') onAppeal();
          }}
        >
          <label>
            {GUARDIAN_CHOICE[composer]}
            <Textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} />
          </label>
          {composer === 'defense' ? (
            <label>
              Adjuntos del descargo, hasta 3
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                multiple
                onChange={(event) => setFiles(limitDefenseFiles(Array.from(event.target.files ?? [])))}
              />
            </label>
          ) : null}
          {files.length > 0 && composer === 'defense' ? <p className={styles.muted}>{files.map((file) => file.name).join(', ')}</p> : null}
          {composer === 'revocation' ? (
            <label className={styles.check}>
              <input type="checkbox" checked={subsidiary} onChange={(event) => setSubsidiary(event.target.checked)} />
              También apelar en subsidio si rechazan la revocatoria
            </label>
          ) : null}
          <Button type="submit" disabled={pending}>Enviar</Button>
        </form>
      ) : null}
    </article>
  );
}

const GUARDIAN_CHOICE = {
  defense: 'Presentar descargo',
  revocation: 'Interponer revocatoria',
  appeal: 'Interponer apelación',
} as const;

const GUARDIAN_NEXT: Record<string, { id: 'defense' | 'revocation' | 'appeal'; title: string; help: string; label: string }> = {
  FORMAL_CHARGE: {
    id: 'defense',
    title: 'Puede defenderse',
    help: 'Esta carta abre el descargo. El plazo es de 3 días hábiles desde el día hábil siguiente.',
    label: 'Escribir el descargo',
  },
  DIRECT_REPRIMAND: {
    id: 'revocation',
    title: 'Puede pedir que se revise',
    help: 'Una amonestación directa no se investiga. La revocatoria tiene 3 días hábiles.',
    label: 'Escribir la revocatoria',
  },
  RESOLUTION: {
    id: 'revocation',
    title: 'Puede impugnar la resolución',
    help: 'La revocatoria la resuelve quien dictó el acto. Si quiere que Dirección revise un rechazo, márquela en subsidio.',
    label: 'Escribir la revocatoria',
  },
};

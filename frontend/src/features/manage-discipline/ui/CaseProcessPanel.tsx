import { portalPathForSession } from '@/shared/auth/portalPaths';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionHasPermission } from '@/shared/auth';
import { Badge, Button, Input, Select, Textarea } from '@/shared/ui';
import { disciplineApi, DisciplineApiError } from '../api/disciplineApi';
import { appealHeading } from '../model/caseActions';
import { formatShortDate } from '../model/businessDays';
import {
  canOfferPrecautionary,
  canOfferWrittenDefense,
  openAppeal,
  validateLength,
  validatePrecautionarySpan,
} from '../model/caseStaffActions';
import { DISCIPLINE_PERMISSIONS, disciplineAppealTrackingPath } from '../model/disciplineRouting';
import { MANDATORY_CLAUSES } from '../model/formalCommunication';
import { notificationKindLabel } from '../model/guardianInbox';
import type { CaseCommunication, DisciplinaryCaseDetail } from '../model/types';
import { AppealResolutionForm } from './AppealResolutionForm';
import styles from './CaseDetailPanel.module.css';

const APPEAL_OUTCOME_LABELS: Record<string, string> = {
  REVOKE: 'Acoge',
  UPHOLD: 'Rechaza',
  MODIFY: 'Acoge parcialmente',
};

const MEDIUM_LABELS: Record<string, string> = {
  NOTEBOOK: 'Cuaderno',
  IN_PERSON: 'Entrega personal',
};

export function CaseProcessPanel({
  detail,
  isConductor,
  canCommunicate,
  onChanged,
  onError,
}: {
  detail: DisciplinaryCaseDetail;
  isConductor: boolean;
  canCommunicate: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const communications = detail.communications ?? [];
  const defenses = detail.defenses ?? [];
  const appeals = detail.appeals ?? [];
  const measures = detail.precautionaryMeasures ?? [];
  const receipts = detail.readReceipts ?? [];
  const alerts = detail.alerts ?? [];
  const canResolve = sessionHasPermission(DISCIPLINE_PERMISSIONS.resolve);
  const canAppeal = sessionHasPermission(DISCIPLINE_PERMISSIONS.appeal);
  const revocation = openAppeal(appeals, 'REVOCATION');
  const appeal = openAppeal(appeals, 'APPEAL');
  const writtenDefense = canOfferWrittenDefense({
    isConductor,
    track: detail.track,
    status: detail.status,
    defenseCount: defenses.length,
  });
  const precautionary = canOfferPrecautionary({
    hasPermission: sessionHasPermission(DISCIPLINE_PERMISSIONS.precautionary),
    track: detail.track,
    status: detail.status,
    severity: detail.severity,
  });

  return (
    <>
      {canCommunicate ? (
        <FormalChargeForm
          detail={detail}
          onChanged={onChanged}
          onError={onError}
        />
      ) : null}

      {communications.length > 0 ? (
        <section className={styles.card}>
          <h3>Comunicaciones</h3>
          {communications.map((item) => (
            <CommunicationRow
              key={item.id}
              item={item}
              caseId={detail.id}
              caseNumber={detail.caseNumber}
              isConductor={isConductor}
              onChanged={onChanged}
              onError={onError}
            />
          ))}
        </section>
      ) : null}

      {communications.length > 0 || alerts.length > 0 || receipts.length > 0 ? (
      <section className={styles.card}>
        <h3>Lectura del encargado</h3>
        {alerts.map((item) => (
          <p key={item.notificationId}>{item.message}</p>
        ))}
        {receipts.length === 0 ? <p className={styles.muted}>Ningún encargado ha confirmado la lectura.</p> : null}
        <ul className={styles.list}>
          {receipts.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      </section>
      ) : null}

      {defenses.length > 0 || writtenDefense ? (
        <section className={styles.card}>
          <h3>Descargo</h3>
          {defenses.map((item) => (
            <article key={item.id}>
              <Badge tone="neutral">{item.channel === 'WRITTEN' ? 'Escrito' : 'Portal'}</Badge>
              <p>{item.body}</p>
            </article>
          ))}
          {writtenDefense ? <WrittenDefenseForm caseId={detail.id} onChanged={onChanged} onError={onError} /> : null}
        </section>
      ) : null}

      {appeals.length > 0 ? (
        <section className={styles.card}>
          <h3>Recursos</h3>
          {appeals.map((item) => (
            <article key={item.id}>
              <strong>
                <Link to={portalPathForSession(disciplineAppealTrackingPath(item.id))}>{appealHeading(item)}</Link>
              </strong>
              <p>{item.body}</p>
              {item.outcome ? (
                <p>
                  {APPEAL_OUTCOME_LABELS[item.outcome] ?? item.outcome}
                  {item.reasoning ? ` · ${item.reasoning}` : ''}
                </p>
              ) : null}
            </article>
          ))}
          {revocation && canResolve && isConductor ? (
            <AppealResolutionForm
              appeal={revocation}
              allowModify={false}
              currentSeverity={detail.severity}
              label="Resolver revocatoria"
              onSubmit={(input) => disciplineApi.resolveRevocation(detail.id, revocation.id, input)}
              onChanged={onChanged}
              onError={onError}
            />
          ) : null}
          {appeal && canAppeal ? (
            <AppealResolutionForm
              appeal={appeal}
              allowModify
              currentSeverity={detail.severity}
              label="Resolver apelación"
              onSubmit={(input) => disciplineApi.resolveAppeal(detail.id, appeal.id, input)}
              onChanged={onChanged}
              onError={onError}
            />
          ) : null}
        </section>
      ) : null}

      {measures.length > 0 || precautionary ? (
        <section className={styles.card}>
          <h3>Retiro precautorio</h3>
          {measures.map((item) => (
            <article key={item.id}>
              <p>
                {formatShortDate(item.startsOn)} – {formatShortDate(item.endsOn)}
                {item.paniCoordination ? ' · Coordinado con el PANI' : ' · Sin coordinación con el PANI'}
              </p>
              <p>{item.reason}</p>
            </article>
          ))}
          {precautionary ? <PrecautionaryForm caseId={detail.id} onChanged={onChanged} onError={onError} /> : null}
        </section>
      ) : null}
    </>
  );
}

function FormalChargeForm({
  detail,
  onChanged,
  onError,
}: {
  detail: DisciplinaryCaseDetail;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [proposedAction, setProposedAction] = useState('');
  const [physical, setPhysical] = useState(false);
  const [medium, setMedium] = useState('IN_PERSON');
  const [deliveredOn, setDeliveredOn] = useState('');
  const [receivedByName, setReceivedByName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validateLength(proposedAction, 10, 2000, 'La acción propuesta');
    if (problem) {
      onError(problem);
      return;
    }
    setPending(true);
    onError(null);
    try {
      await disciplineApi.sendFormalCommunication(detail.id, proposedAction.trim());
      setProposedAction('');
      onChanged();
    } catch (reason) {
      if (reason instanceof DisciplineApiError && reason.code === 'PHYSICAL_DELIVERY_REQUIRED') setPhysical(true);
      onError(reason instanceof Error ? reason.message : 'No se pudo comunicar el cargo.');
    } finally {
      setPending(false);
    }
  };

  const deliver = async (event: FormEvent) => {
    event.preventDefault();
    const problem =
      validateLength(proposedAction, 10, 2000, 'La acción propuesta') ??
      validateLength(receivedByName, 2, 150, 'Quien recibe');
    if (problem || !deliveredOn) {
      onError(problem ?? 'Indique la fecha de entrega.');
      return;
    }
    setPending(true);
    onError(null);
    try {
      await disciplineApi.deliverFormalCharge(
        detail.id,
        { proposedAction: proposedAction.trim(), medium, deliveredOn, receivedByName: receivedByName.trim() },
        file ?? undefined,
      );
      onChanged();
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : 'No se pudo registrar la entrega.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.card}>
      <h3>Comunicar el cargo</h3>
      <p className={styles.note}>Estas cláusulas se agregan siempre y no se pueden quitar:</p>
      <ol className={styles.clauses}>
        {MANDATORY_CLAUSES.map((clause) => (
          <li key={clause}>{clause}</li>
        ))}
      </ol>
      <form className={styles.form} onSubmit={physical ? deliver : send}>
        <label>
          Acción correctiva propuesta
          <Textarea rows={3} value={proposedAction} onChange={(event) => setProposedAction(event.target.value)} />
        </label>
        {physical ? (
          <DeliveryFields
            medium={medium}
            deliveredOn={deliveredOn}
            receivedByName={receivedByName}
            onMedium={setMedium}
            onDate={setDeliveredOn}
            onReceiver={setReceivedByName}
            onFile={setFile}
          />
        ) : null}
        <div className={styles.inline}>
          <Button type="submit" disabled={pending}>
            {physical ? 'Registrar entrega física' : 'Enviar al encargado'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setPhysical((current) => !current)}>
            {physical ? 'Volver al envío digital' : 'Entrega física'}
          </Button>
        </div>
      </form>
    </section>
  );
}

function CommunicationRow({
  item,
  caseId,
  caseNumber,
  isConductor,
  onChanged,
  onError,
}: {
  item: CaseCommunication;
  caseId: number;
  caseNumber: string;
  isConductor: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [medium, setMedium] = useState('NOTEBOOK');
  const [deliveredOn, setDeliveredOn] = useState('');
  const [receivedByName, setReceivedByName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validateLength(receivedByName, 2, 150, 'Quien recibe');
    if (problem || !deliveredOn) {
      onError(problem ?? 'Indique la fecha de entrega.');
      return;
    }
    setPending(true);
    onError(null);
    try {
      await disciplineApi.recordDelivery(
        caseId,
        item.id,
        { medium, deliveredOn, receivedByName: receivedByName.trim() },
        file ?? undefined,
      );
      onChanged();
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : 'No se pudo registrar la entrega.');
    } finally {
      setPending(false);
    }
  };

  return (
    <article>
      <div className={styles.inline}>
        <strong>{notificationKindLabel(item.kind)}</strong>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            void disciplineApi.downloadCommunicationPdf(caseId, item.id, `comunicacion-${caseNumber}.pdf`)
          }
        >
          Imprimir
        </Button>
      </div>
      {item.deliveryMedium ? (
        <p className={styles.muted}>
          Entregado por {MEDIUM_LABELS[item.deliveryMedium] ?? item.deliveryMedium}
          {item.receivedByName ? ` a ${item.receivedByName}` : ''}
          {item.deliveredAt ? ` el ${formatShortDate(item.deliveredAt.slice(0, 10))}` : ''}
        </p>
      ) : isConductor ? (
        open ? (
          <form className={styles.form} onSubmit={save}>
            <DeliveryFields
              medium={medium}
              deliveredOn={deliveredOn}
              receivedByName={receivedByName}
              onMedium={setMedium}
              onDate={setDeliveredOn}
              onReceiver={setReceivedByName}
              onFile={setFile}
            />
            <Button type="submit" disabled={pending}>
              Guardar entrega
            </Button>
          </form>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
            Registrar entrega física
          </Button>
        )
      ) : null}
    </article>
  );
}

function DeliveryFields({
  medium,
  deliveredOn,
  receivedByName,
  onMedium,
  onDate,
  onReceiver,
  onFile,
}: {
  medium: string;
  deliveredOn: string;
  receivedByName: string;
  onMedium: (value: string) => void;
  onDate: (value: string) => void;
  onReceiver: (value: string) => void;
  onFile: (file: File | null) => void;
}) {
  return (
    <>
      <div className={styles.grid}>
        <label>
          Medio
          <Select value={medium} onChange={(event) => onMedium(event.target.value)}>
            <option value="NOTEBOOK">Cuaderno</option>
            <option value="IN_PERSON">Entrega personal</option>
          </Select>
        </label>
        <label>
          Fecha de entrega
          <Input type="date" value={deliveredOn} required onChange={(event) => onDate(event.target.value)} />
        </label>
      </div>
      <label>
        Quien recibe
        <Input value={receivedByName} onChange={(event) => onReceiver(event.target.value)} />
      </label>
      <label>
        Acuse (opcional)
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
      </label>
    </>
  );
}

function WrittenDefenseForm({
  caseId,
  onChanged,
  onError,
}: {
  caseId: number;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validateLength(body, 10, 4000, 'El descargo');
    if (problem || !file) {
      onError(problem ?? 'Adjunte el documento del descargo.');
      return;
    }
    setPending(true);
    onError(null);
    try {
      await disciplineApi.fileWrittenDefense(caseId, body.trim(), file);
      onChanged();
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : 'No se pudo registrar el descargo.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label>
        Descargo escrito
        <Textarea rows={4} value={body} onChange={(event) => setBody(event.target.value)} />
      </label>
      <label>
        Documento
        <input
          type="file"
          required
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <Button type="submit" disabled={pending}>
        Registrar descargo escrito
      </Button>
    </form>
  );
}

function PrecautionaryForm({
  caseId,
  onChanged,
  onError,
}: {
  caseId: number;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [reason, setReason] = useState('');
  const [pani, setPani] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validatePrecautionarySpan(startsOn, endsOn) ?? validateLength(reason, 10, 2000, 'El motivo');
    if (problem) {
      onError(problem);
      return;
    }
    setPending(true);
    onError(null);
    try {
      await disciplineApi.orderPrecautionary(caseId, {
        startsOn,
        endsOn,
        reason: reason.trim(),
        paniCoordination: pani,
      });
      onChanged();
    } catch (reasonError) {
      onError(reasonError instanceof Error ? reasonError.message : 'No se pudo ordenar el retiro.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <p className={styles.note}>No cambia la gravedad ni la nota de conducta. Máximo 10 días naturales.</p>
      <div className={styles.grid}>
        <label>
          Inicio
          <Input type="date" value={startsOn} required onChange={(event) => setStartsOn(event.target.value)} />
        </label>
        <label>
          Fin
          <Input type="date" value={endsOn} required onChange={(event) => setEndsOn(event.target.value)} />
        </label>
      </div>
      <label>
        Motivo
        <Textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>
      <label className={styles.check}>
        <input type="checkbox" checked={pani} onChange={(event) => setPani(event.target.checked)} />
        Se coordinó con el PANI
      </label>
      <Button type="submit" disabled={pending}>
        Ordenar retiro precautorio
      </Button>
    </form>
  );
}

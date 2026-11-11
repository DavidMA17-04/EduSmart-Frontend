import { FileSignature, Printer, RotateCcw } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Button, Input, Select, Textarea } from '@/shared/ui';
import {
  buildFormalCommunicationHtml,
  EMPTY_FORMAL_COMMUNICATION,
  type FormalCommunicationFields,
  LOGO_PATH,
  printHtmlDocument,
} from '../model/formalCommunication';
import { SEVERITY_DEDUCTIONS, SEVERITY_LABELS, SEVERITY_ORDER } from '../model/severity';
import type { InfractionSeverity } from '../model/types';
import styles from './DueProcessFlowPanel.module.css';

type TextField = Exclude<keyof FormalCommunicationFields, 'severity' | 'facts' | 'proposedAction'>;

const TEXT_FIELDS: Array<{ key: TextField; label: string; type?: string }> = [
  { key: 'studentName', label: 'Estudiante implicado' },
  { key: 'studentId', label: 'Cédula del estudiante' },
  { key: 'section', label: 'Sección' },
  { key: 'reportingTeacher', label: 'Docente que reporta' },
  { key: 'guideTeacher', label: 'Docente guía' },
  { key: 'infraction', label: 'Falta atribuida' },
  { key: 'incidentDate', label: 'Fecha del hecho', type: 'date' },
  { key: 'place', label: 'Lugar' },
];

/** Case-sourced fields stay locked; teachers stay editable when blank or always tweakable. */
const CASE_LOCKED: ReadonlySet<keyof FormalCommunicationFields> = new Set([
  'studentName',
  'studentId',
  'section',
  'infraction',
  'severity',
  'incidentDate',
  'place',
  'facts',
]);

export type FormalCommunicationPreviewProps = {
  mode?: 'demo' | 'case';
  initialFields?: FormalCommunicationFields;
  caseNumber?: string;
  /** Controlled proposed action (case mode / send form). */
  proposedAction?: string;
  onProposedActionChange?: (value: string) => void;
  /** Extra controls under print (send / entrega física). */
  actions?: ReactNode;
  intro?: ReactNode;
};

export const FormalCommunicationPreview = ({
  mode = 'demo',
  initialFields,
  caseNumber,
  proposedAction,
  onProposedActionChange,
  actions,
  intro,
}: FormalCommunicationPreviewProps) => {
  const [fields, setFields] = useState<FormalCommunicationFields>(
    () => initialFields ?? EMPTY_FORMAL_COMMUNICATION,
  );

  useEffect(() => {
    if (initialFields) setFields(initialFields);
  }, [initialFields]);

  const actionText = proposedAction ?? fields.proposedAction;
  const effectiveFields: FormalCommunicationFields = {
    ...fields,
    proposedAction: actionText,
  };

  const html = useMemo(
    () =>
      buildFormalCommunicationHtml(
        { ...fields, proposedAction: actionText },
        {
          logoUrl: `${window.location.origin}${LOGO_PATH}`,
          caseNumber,
        },
      ),
    [actionText, caseNumber, fields],
  );

  const set = <K extends keyof FormalCommunicationFields>(
    key: K,
    next: FormalCommunicationFields[K],
  ) => {
    if (key === 'proposedAction' && onProposedActionChange) {
      onProposedActionChange(String(next));
      return;
    }
    setFields((current) => ({ ...current, [key]: next }));
  };

  const locked = (key: keyof FormalCommunicationFields) =>
    mode === 'case' && CASE_LOCKED.has(key);

  return (
    <section aria-labelledby="formal-comm-title" className={styles.card}>
      <h2 className={styles.cardTitle} id="formal-comm-title">
        <FileSignature aria-hidden="true" size={18} /> Comunicación formal al encargado · paso 3
        <span className={styles.total}>
          {mode === 'case'
            ? caseNumber
              ? `Expediente ${caseNumber}`
              : 'Documento del expediente'
            : 'Simulador pedagógico'}
        </span>
      </h2>
      {intro}
      <div className={styles.letterLayout}>
        <div className={styles.letterFields}>
          {TEXT_FIELDS.map((field) => (
            <label className={styles.calculatorField} htmlFor={`fc-${field.key}`} key={field.key}>
              <span>{field.label}</span>
              <Input
                id={`fc-${field.key}`}
                onChange={(event) => set(field.key, event.target.value)}
                readOnly={locked(field.key)}
                type={field.type ?? 'text'}
                value={fields[field.key]}
              />
            </label>
          ))}
          <label className={styles.calculatorField} htmlFor="fc-severity">
            <span>Gravedad</span>
            <Select
              disabled={locked('severity')}
              id="fc-severity"
              onChange={(event) => set('severity', event.target.value as InfractionSeverity)}
              value={fields.severity}
            >
              {SEVERITY_ORDER.map((severity) => (
                <option key={severity} value={severity}>
                  {SEVERITY_LABELS[severity]} · −{SEVERITY_DEDUCTIONS[severity]}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles.calculatorField} htmlFor="fc-facts">
            <span>Descripción de los hechos</span>
            <Textarea
              id="fc-facts"
              onChange={(event) => set('facts', event.target.value)}
              readOnly={locked('facts')}
              rows={3}
              value={fields.facts}
            />
          </label>
          <label className={styles.calculatorField} htmlFor="fc-action">
            <span>Acción correctiva propuesta</span>
            <Textarea
              id="fc-action"
              onChange={(event) => set('proposedAction', event.target.value)}
              rows={2}
              value={effectiveFields.proposedAction}
            />
          </label>
          <div className={styles.letterActions}>
            <Button onClick={() => printHtmlDocument(html)} type="button">
              <Printer aria-hidden="true" size={16} />
              Imprimir documento
            </Button>
            {mode === 'demo' ? (
              <Button
                onClick={() => setFields(EMPTY_FORMAL_COMMUNICATION)}
                type="button"
                variant="secondary"
              >
                <RotateCcw aria-hidden="true" size={16} />
                Limpiar
              </Button>
            ) : null}
          </div>
        </div>
        <iframe
          className={styles.letterFrame}
          sandbox="allow-same-origin"
          srcDoc={html}
          title="Vista previa de la comunicación formal"
        />
      </div>
      {actions}
    </section>
  );
};

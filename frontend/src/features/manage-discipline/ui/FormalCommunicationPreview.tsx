import { FileSignature, Printer, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
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

export const FormalCommunicationPreview = () => {
  const [fields, setFields] = useState<FormalCommunicationFields>(EMPTY_FORMAL_COMMUNICATION);
  const html = useMemo(
    () =>
      buildFormalCommunicationHtml(fields, {
        logoUrl: `${window.location.origin}${LOGO_PATH}`,
      }),
    [fields],
  );
  const set = <K extends keyof FormalCommunicationFields>(
    key: K,
    next: FormalCommunicationFields[K],
  ) => setFields((current) => ({ ...current, [key]: next }));

  return (
    <section aria-labelledby="formal-comm-title" className={styles.card}>
      <h2 className={styles.cardTitle} id="formal-comm-title">
        <FileSignature aria-hidden="true" size={18} /> Comunicación formal al encargado · paso 3
        <span className={styles.total}>Documento para el expediente físico</span>
      </h2>
      <div className={styles.letterLayout}>
        <div className={styles.letterFields}>
          {TEXT_FIELDS.map((field) => (
            <label className={styles.calculatorField} htmlFor={`fc-${field.key}`} key={field.key}>
              <span>{field.label}</span>
              <Input
                id={`fc-${field.key}`}
                onChange={(event) => set(field.key, event.target.value)}
                type={field.type ?? 'text'}
                value={fields[field.key]}
              />
            </label>
          ))}
          <label className={styles.calculatorField} htmlFor="fc-severity">
            <span>Gravedad</span>
            <Select
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
              value={fields.proposedAction}
            />
          </label>
          <div className={styles.letterActions}>
            <Button onClick={() => printHtmlDocument(html)} type="button">
              <Printer aria-hidden="true" size={16} />
              Imprimir documento
            </Button>
            <Button
              onClick={() => setFields(EMPTY_FORMAL_COMMUNICATION)}
              type="button"
              variant="secondary"
            >
              <RotateCcw aria-hidden="true" size={16} />
              Limpiar
            </Button>
          </div>
        </div>
        <iframe
          className={styles.letterFrame}
          sandbox="allow-same-origin"
          srcDoc={html}
          title="Vista previa de la comunicación formal"
        />
      </div>
    </section>
  );
};

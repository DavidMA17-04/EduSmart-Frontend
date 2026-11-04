import { formatShortDate, todayIso } from './businessDays';
import { SEVERITY_DEDUCTIONS, SEVERITY_LABELS } from './severity';
import type { InfractionSeverity } from './types';

export type FormalCommunicationFields = {
  studentName: string;
  studentId: string;
  section: string;
  reportingTeacher: string;
  guideTeacher: string;
  infraction: string;
  severity: InfractionSeverity;
  incidentDate: string;
  place: string;
  facts: string;
  proposedAction: string;
};

export const EMPTY_FORMAL_COMMUNICATION: FormalCommunicationFields = {
  studentName: '',
  studentId: '',
  section: '',
  reportingTeacher: '',
  guideTeacher: '',
  infraction: '',
  severity: 'SERIOUS',
  incidentDate: '',
  place: '',
  facts: '',
  proposedAction: '',
};

/** Su omisión hace nulo el proceso (guía de debido proceso, paso 3): no son editables. */
export const MANDATORY_CLAUSES: readonly string[] = [
  'Tiene derecho a conocer y acceder al expediente disciplinario en cualquier momento del proceso.',
  'Tiene derecho a hacerse acompañar y asesorar por un abogado.',
  'Cuenta con tres (3) días hábiles a partir de esta notificación para presentar su descargo y las pruebas que considere pertinentes.',
];

export const LOGO_PATH = '/brand/ctp-hojancha-logo.jpeg';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function value(text: string, label: string): string {
  const trimmed = text.trim();
  return trimmed
    ? escapeHtml(trimmed)
    : `<span class="blank">${escapeHtml(label)}</span>`;
}

export function buildFormalCommunicationHtml(
  fields: FormalCommunicationFields,
  options: { logoUrl: string; issuedOn?: string },
): string {
  const issuedOn = formatShortDate(options.issuedOn ?? todayIso());
  const incident = fields.incidentDate ? formatShortDate(fields.incidentDate) : '';
  const severity = `${SEVERITY_LABELS[fields.severity]} · rebajo propuesto de ${SEVERITY_DEDUCTIONS[fields.severity]} puntos`;
  const pair = (labelA: string, contentA: string, labelB: string, contentB: string) =>
    `<tr><th>${labelA}</th><td>${contentA}</td><th>${labelB}</th><td>${contentB}</td></tr>`;
  const wide = (label: string, content: string) =>
    `<tr><th>${label}</th><td colspan="3">${content}</td></tr>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Comunicación formal · ${escapeHtml(fields.studentName.trim() || 'Expediente disciplinario')}</title>
<style>
  @page { size: letter; margin: 11mm 14mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; }
  body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; color: #1d2939; font-size: 9.5pt; line-height: 1.35; }
  .sheet { max-width: 188mm; min-height: 254mm; margin: 0 auto; padding: 2mm 0; display: flex; flex-direction: column; }
  header { display: flex; align-items: center; gap: 12px; padding-bottom: 8px; border-bottom: 3px solid #1f4e79; }
  header img { width: 54px; height: 54px; object-fit: contain; }
  .inst { flex: 1; }
  .inst strong { display: block; font-size: 12.5pt; color: #1f4e79; }
  .inst span { display: block; font-size: 8.5pt; color: #667085; }
  .file { border: 1.5px solid #1f4e79; border-radius: 6px; padding: 5px 9px; font-size: 8pt; color: #1f4e79; min-width: 145px; }
  .file div { display: flex; justify-content: space-between; gap: 8px; }
  .file div + div { margin-top: 2px; }
  h1 { margin: 10px 0 1px; font-size: 13pt; text-align: center; letter-spacing: .04em; color: #1f4e79; }
  .subtitle { margin: 0 0 8px; text-align: center; font-size: 8.5pt; color: #667085; }
  h2 { margin: 9px 0 4px; font-size: 9pt; text-transform: uppercase; letter-spacing: .05em; color: #1f4e79; border-bottom: 1px solid #d0d5dd; padding-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td { text-align: left; padding: 4px 7px; border: 1px solid #d0d5dd; vertical-align: top; font-size: 9pt; overflow-wrap: anywhere; }
  th { width: 17%; background: #f2f4f7; font-weight: 600; color: #344054; }
  p { margin: 0 0 4px; }
  .box { border: 1px solid #d0d5dd; border-radius: 6px; padding: 6px 9px; min-height: 40px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .box.facts { flex: 3 1 auto; }
  .box.action { flex: 2 1 auto; }
  .rights { border: 1.5px solid #1f4e79; border-radius: 6px; background: #eff6ff; padding: 6px 10px; }
  .rights ol { margin: 2px 0 0; padding-left: 18px; }
  .rights li { margin-bottom: 2px; font-weight: 600; color: #1f4e79; }
  .note { font-size: 8pt; color: #667085; margin: 4px 0 0; }
  .blank { display: inline-block; min-width: 110px; border-bottom: 1px dotted #98a2b3; color: #98a2b3; font-size: 8pt; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: auto; padding-top: 48px; }
  .signature { border-top: 1px solid #1d2939; padding-top: 3px; text-align: center; font-size: 8.5pt; }
  .signature span { display: block; color: #667085; font-size: 8pt; }
  footer { margin-top: 12px; padding-top: 5px; border-top: 1px solid #d0d5dd; display: flex; justify-content: space-between; font-size: 7.5pt; color: #667085; }
</style>
</head>
<body>
<div class="sheet">
  <header>
    <img src="${escapeHtml(options.logoUrl)}" alt="Logo CTP de Hojancha" />
    <div class="inst">
      <strong>Colegio Técnico Profesional de Hojancha</strong>
      <span>Ministerio de Educación Pública · Hojancha, Guanacaste, Costa Rica</span>
      <span>Tel. (+506) 2659-9045 · ctp.dehojancha@mep.go.cr</span>
    </div>
    <div class="file">
      <div><span>Expediente N.º</span><strong>AM-______</strong></div>
      <div><span>Emitido</span><strong>${issuedOn}</strong></div>
    </div>
  </header>

  <h1>COMUNICACIÓN FORMAL AL ENCARGADO LEGAL</h1>
  <p class="subtitle">Debido proceso disciplinario · REAC 2026, Art. 150 · Paso 3</p>

  <p>Señor(a) encargado(a) legal:</p>
  <p>Por este medio se le comunica formalmente la apertura del procedimiento disciplinario que se detalla a continuación, en resguardo del debido proceso y de los derechos de la persona estudiante.</p>

  <h2>Datos del caso</h2>
  <table>
    ${pair('Estudiante implicado', value(fields.studentName, 'nombre completo'), 'Cédula', value(fields.studentId, 'identificación'))}
    ${pair('Sección', value(fields.section, 'sección'), 'Fecha del hecho', incident ? escapeHtml(incident) : value('', 'fecha'))}
    ${pair('Docente que reporta', value(fields.reportingTeacher, 'nombre del docente'), 'Docente guía', value(fields.guideTeacher, 'nombre del docente guía'))}
    ${wide('Falta atribuida', value(fields.infraction, 'tipo de falta'))}
    ${pair('Gravedad', escapeHtml(severity), 'Lugar', value(fields.place, 'lugar'))}
  </table>

  <h2>Descripción de los hechos</h2>
  <div class="box facts">${value(fields.facts, 'circunstancias de modo, tiempo y lugar')}</div>

  <h2>Acción correctiva propuesta</h2>
  <div class="box action">${value(fields.proposedAction, 'acción propuesta')}</div>

  <h2>Derechos de la persona estudiante y su encargado</h2>
  <div class="rights">
    <ol>${MANDATORY_CLAUSES.map((clause) => `<li>${escapeHtml(clause)}</li>`).join('')}</ol>
    <p class="note">Presunción de inocencia: el rebajo en la nota de conducta solo se aplicará cuando la resolución quede firme. Contra la resolución caben los recursos de revocatoria y apelación.</p>
  </div>

  <div class="signatures">
    <div class="signature">${value(fields.guideTeacher, 'Docente guía')}<span>Docente guía · firma</span></div>
    <div class="signature">Encargado(a) legal · recibido conforme<span>Fecha y hora: ____ / ____ / ______ · ____:____</span></div>
  </div>

  <footer>
    <span>Original: encargado legal · Copia: expediente del estudiante</span>
    <span>Generado con EduSmart · CTP de Hojancha</span>
  </footer>
</div>
</body>
</html>`;
}

/** Imprime en un iframe aislado para que solo salga el documento, sin la interfaz. */
export function printHtmlDocument(html: string): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.position = 'fixed';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);

  const cleanup = () => setTimeout(() => frame.remove(), 1000);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const print = () => {
    win.focus();
    win.print();
    cleanup();
  };
  const logo = doc.querySelector('img');
  if (logo && !logo.complete) {
    logo.addEventListener('load', print, { once: true });
    logo.addEventListener('error', print, { once: true });
  } else {
    print();
  }
}

import type { ScheduleEntry, ScheduleSlotType, ScheduleTimeSlot } from '@/entities/schedule';
import { scheduleApi } from '../api/scheduleApi';
import {
  SCHEDULE_WEEKDAYS,
  formatSlotRange,
  nonClassSlotLabel,
} from './scheduleLabels';

export type ScheduleExportContext = {
  periodLabel: string;
  teacherLabel: string;
  groupLabel: string;
  slots: ScheduleTimeSlot[];
  entriesByCell: Map<string, ScheduleEntry[]>;
  showTeacher: boolean;
  showGroup: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function entryLine(
  entry: ScheduleEntry,
  showTeacher: boolean,
  showGroup: boolean,
): string {
  const ta = entry.teachingAssignment;
  const parts = [ta.offering.name];
  if (showGroup) parts.push(ta.group.name);
  if (showTeacher) parts.push(ta.teacher.name);
  return parts.join(' · ');
}

export function scheduleCellText(
  slot: ScheduleTimeSlot,
  dayOfWeek: number,
  entriesByCell: Map<string, ScheduleEntry[]>,
  showTeacher: boolean,
  showGroup: boolean,
): string {
  if (slot.slotType !== 'CLASS') {
    return nonClassSlotLabel(slot.slotType, slot.name);
  }
  const entries = entriesByCell.get(`${dayOfWeek}:${slot.id}`) ?? [];
  if (entries.length === 0) return '—';
  return entries.map((entry) => entryLine(entry, showTeacher, showGroup)).join('\n');
}

export function buildScheduleSheetRows(ctx: ScheduleExportContext): string[][] {
  const header = ['Hora', ...SCHEDULE_WEEKDAYS.map((day) => day.label)];
  const rows = ctx.slots.map((slot) => {
    const timeLabel = [
      formatSlotRange(slot.startTime, slot.endTime),
      slot.slotType !== 'CLASS' ? nonClassSlotLabel(slot.slotType, slot.name) : slot.name,
    ]
      .filter(Boolean)
      .join(' · ');
    return [
      timeLabel,
      ...SCHEDULE_WEEKDAYS.map((day) =>
        scheduleCellText(slot, day.dayOfWeek, ctx.entriesByCell, ctx.showTeacher, ctx.showGroup),
      ),
    ];
  });
  return [header, ...rows];
}

function slugPart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .toLowerCase() || 'horario';
}

export function scheduleExportFileBase(ctx: ScheduleExportContext): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const focus =
    ctx.groupLabel !== 'Todas'
      ? ctx.groupLabel
      : ctx.teacherLabel !== 'Todos'
        ? ctx.teacherLabel
        : 'general';
  return `horario-${slugPart(ctx.periodLabel)}-${slugPart(focus)}-${stamp}`;
}

export type ScheduleExportPayload = {
  periodLabel: string;
  teacherLabel: string;
  groupLabel: string;
  rows: Array<{
    time: string;
    label?: string;
    kind: ScheduleSlotType;
    days: Array<{ entries: Array<{ title: string; detail?: string }> }>;
  }>;
};

/** Cuadrícula visible (mismos filtros) para el Excel institucional del servidor. */
export function buildScheduleExportPayload(ctx: ScheduleExportContext): ScheduleExportPayload {
  return {
    periodLabel: ctx.periodLabel,
    teacherLabel: ctx.teacherLabel,
    groupLabel: ctx.groupLabel,
    rows: ctx.slots.map((slot) => {
      const isClass = slot.slotType === 'CLASS';
      const label = isClass ? slot.name?.trim() : nonClassSlotLabel(slot.slotType, slot.name);
      return {
        time: formatSlotRange(slot.startTime, slot.endTime),
        ...(label ? { label } : {}),
        kind: slot.slotType,
        days: SCHEDULE_WEEKDAYS.map((day) => ({
          entries: isClass
            ? (ctx.entriesByCell.get(`${day.dayOfWeek}:${slot.id}`) ?? []).map((entry) => {
                const ta = entry.teachingAssignment;
                const detail = [
                  ctx.showGroup ? ta.group.name : null,
                  ctx.showTeacher ? ta.teacher.name : null,
                ]
                  .filter(Boolean)
                  .join(' · ');
                return detail ? { title: ta.offering.name, detail } : { title: ta.offering.name };
              })
            : [],
        })),
      };
    }),
  };
}

export async function downloadScheduleExcel(ctx: ScheduleExportContext): Promise<void> {
  const blob = await scheduleApi.exportExcel(buildScheduleExportPayload(ctx));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${scheduleExportFileBase(ctx)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function buildPrintHtml(ctx: ScheduleExportContext): string {
  const subtitle = [
    ctx.periodLabel,
    ctx.teacherLabel !== 'Todos' ? `Docente: ${ctx.teacherLabel}` : null,
    ctx.groupLabel !== 'Todas' ? `Sección: ${ctx.groupLabel}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const head = `
    <tr>
      <th>Hora</th>
      ${SCHEDULE_WEEKDAYS.map((day) => `<th>${escapeHtml(day.label)}</th>`).join('')}
    </tr>
  `;

  const body = ctx.slots
    .map((slot) => {
      const time = formatSlotRange(slot.startTime, slot.endTime);
      const secondary =
        slot.slotType !== 'CLASS'
          ? nonClassSlotLabel(slot.slotType, slot.name)
          : slot.name;
      const cells = SCHEDULE_WEEKDAYS.map((day) => {
        const text = scheduleCellText(
          slot,
          day.dayOfWeek,
          ctx.entriesByCell,
          ctx.showTeacher,
          ctx.showGroup,
        );
        return `<td>${escapeHtml(text).replaceAll('\n', '<br/>')}</td>`;
      }).join('');
      return `
        <tr>
          <th>
            <strong>${escapeHtml(time)}</strong>
            ${secondary ? `<span>${escapeHtml(secondary)}</span>` : ''}
          </th>
          ${cells}
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Horario · ${escapeHtml(ctx.periodLabel)}</title>
  <style>
    @page { size: landscape; margin: 6mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    body {
      font-family: "Segoe UI", Tahoma, sans-serif;
      color: #021a53;
      background: #fff;
      display: flex;
      flex-direction: column;
    }
    header {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      align-items: baseline;
      margin-bottom: 0.35rem;
      border-bottom: 2px solid #cfac65;
      padding-bottom: 0.25rem;
      flex: 0 0 auto;
    }
    h1 {
      margin: 0;
      font-size: 11pt;
      color: #002e7a;
      line-height: 1.15;
    }
    p {
      margin: 0.1rem 0 0;
      color: #334155;
      font-size: 8pt;
      line-height: 1.2;
    }
    .sheet {
      flex: 1 1 auto;
      min-height: 0;
    }
    table {
      width: 100%;
      height: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 7pt;
      line-height: 1.2;
    }
    th, td {
      border: 1px solid #94a3b8;
      padding: 2px 3px;
      vertical-align: top;
      text-align: left;
      overflow: hidden;
    }
    thead th {
      background: #002e7a;
      color: #fff;
      text-align: center;
      font-weight: 700;
      font-size: 7.5pt;
      padding: 3px 2px;
    }
    tbody th {
      width: 11%;
      background: #eef2f7;
      color: #021a53;
      font-size: 6.5pt;
    }
    tbody th strong {
      display: block;
      font-size: 7pt;
      white-space: nowrap;
    }
    tbody th span {
      display: block;
      margin-top: 1px;
      font-weight: 600;
      color: #64748b;
      font-size: 6pt;
    }
    td {
      font-size: 6.5pt;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Horario semanal</h1>
      <p>${escapeHtml(subtitle)}</p>
    </div>
    <p>C.T.P. de Hojancha · EduSmart</p>
  </header>
  <div class="sheet">
    <table>
      <thead>${head}</thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</body>
</html>`;
}

export function printSchedule(ctx: ScheduleExportContext): void {
  const html = buildPrintHtml(ctx);
  const frame = document.createElement('iframe');
  frame.setAttribute('title', 'Impresión de horario');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  frame.style.opacity = '0';
  frame.style.pointerEvents = 'none';
  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  const frameDocument = frame.contentDocument ?? frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    frame.remove();
    throw new Error('No se pudo preparar la impresión del horario.');
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  let printed = false;
  const cleanup = () => {
    window.setTimeout(() => frame.remove(), 800);
  };

  const runPrint = () => {
    if (printed) return;
    printed = true;
    try {
      frameWindow.focus();
      frameWindow.print();
    } finally {
      cleanup();
    }
  };

  frame.addEventListener('load', () => runPrint(), { once: true });
  window.setTimeout(runPrint, 350);
}

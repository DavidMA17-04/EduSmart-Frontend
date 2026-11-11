import { describe, expect, it } from 'vitest';
import {
  buildFormalCommunicationHtml,
  EMPTY_FORMAL_COMMUNICATION,
  fieldsFromCaseDetail,
  MANDATORY_CLAUSES,
} from './formalCommunication';
import type { DisciplinaryCaseDetail } from './types';

const OPTIONS = { logoUrl: '/brand/ctp-hojancha-logo.jpeg', issuedOn: '2026-10-14' };

describe('comunicación formal (paso 3)', () => {
  it('incluye siempre las cláusulas de expediente, abogado y descargo', () => {
    const html = buildFormalCommunicationHtml(EMPTY_FORMAL_COMMUNICATION, OPTIONS);
    expect(MANDATORY_CLAUSES).toHaveLength(3);
    for (const clause of MANDATORY_CLAUSES) {
      expect(html).toContain(clause);
    }
  });

  it('marca los campos faltantes como espacios para completar', () => {
    const html = buildFormalCommunicationHtml(EMPTY_FORMAL_COMMUNICATION, OPTIONS);
    expect(html).toContain('<span class="blank">nombre completo</span>');
    expect(html).toContain('<span class="blank">acción propuesta</span>');
  });

  it('usa los datos ingresados, el logo y la gravedad con su rebajo', () => {
    const html = buildFormalCommunicationHtml(
      {
        ...EMPTY_FORMAL_COMMUNICATION,
        studentName: 'Ana Pérez',
        reportingTeacher: 'Prof. Rojas',
        severity: 'VERY_SERIOUS',
        incidentDate: '2026-10-14',
      },
      OPTIONS,
    );
    expect(html).toContain('Ana Pérez');
    expect(html).toContain('Prof. Rojas');
    expect(html).toContain('Muy grave · rebajo propuesto de 35 puntos');
    expect(html).toContain('mié 14 oct 2026');
    expect(html).toContain('src="/brand/ctp-hojancha-logo.jpeg"');
  });

  it('pone el número de expediente cuando se indica', () => {
    const html = buildFormalCommunicationHtml(EMPTY_FORMAL_COMMUNICATION, {
      ...OPTIONS,
      caseNumber: 'AM-2026-0042',
    });
    expect(html).toContain('AM-2026-0042');
    expect(html).not.toContain('AM-______');
  });

  it('tolera campos nulos del expediente sin romper el HTML', () => {
    const fields = fieldsFromCaseDetail({
      severity: 'SERIOUS',
      place: null,
      description: null,
      student: { id: 9, fullName: 'Luis Mora', nationalId: null },
      events: [],
    } as unknown as DisciplinaryCaseDetail);
    expect(fields.studentId).toBe('');
    expect(fields.place).toBe('');
    expect(fields.facts).toBe('');
    expect(() => buildFormalCommunicationHtml(fields, OPTIONS)).not.toThrow();
  });

  it('arma los campos desde el detalle del expediente', () => {
    const detail = {
      caseNumber: 'AM-2026-0007',
      severity: 'SERIOUS',
      infractionName: 'Irrespeto a un docente',
      place: 'Aula 12',
      description: 'Interrumpió la clase con gritos.',
      occurredAt: '2026-10-14T15:00:00.000Z',
      sectionLabel: '10-1',
      sectionName: 'Décimo',
      student: { id: 9, fullName: 'Luis Mora', nationalId: '1-2345-6789' },
      reporterUserId: 4,
      responsibleUserId: 8,
      events: [
        {
          id: 1,
          type: 'CASE_OPENED',
          actorUserId: 4,
          actorName: 'Prof. Rojas',
          fromStatus: null,
          toStatus: 'OPEN',
          payload: null,
          visibility: 'STAFF',
          createdAt: '2026-10-14T16:00:00.000Z',
        },
        {
          id: 2,
          type: 'ASSIGNED',
          actorUserId: 8,
          actorName: 'Guía Sol',
          fromStatus: null,
          toStatus: null,
          payload: null,
          visibility: 'STAFF',
          createdAt: '2026-10-14T16:05:00.000Z',
        },
      ],
    } as DisciplinaryCaseDetail;

    const fields = fieldsFromCaseDetail(detail);
    expect(fields.studentName).toBe('Luis Mora');
    expect(fields.studentId).toBe('1-2345-6789');
    expect(fields.section).toBe('10-1');
    expect(fields.infraction).toBe('Irrespeto a un docente');
    expect(fields.place).toBe('Aula 12');
    expect(fields.facts).toBe('Interrumpió la clase con gritos.');
    expect(fields.incidentDate).toBe('2026-10-14');
    expect(fields.reportingTeacher).toBe('Prof. Rojas');
    expect(fields.guideTeacher).toBe('Guía Sol');
    expect(fields.proposedAction).toBe('');
  });

  it('escapa el HTML ingresado por el usuario', () => {
    const html = buildFormalCommunicationHtml(
      { ...EMPTY_FORMAL_COMMUNICATION, studentName: '<script>alert(1)</script>' },
      OPTIONS,
    );
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

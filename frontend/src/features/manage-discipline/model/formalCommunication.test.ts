import { describe, expect, it } from 'vitest';
import {
  buildFormalCommunicationHtml,
  EMPTY_FORMAL_COMMUNICATION,
  MANDATORY_CLAUSES,
} from './formalCommunication';

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

  it('escapa el HTML ingresado por el usuario', () => {
    const html = buildFormalCommunicationHtml(
      { ...EMPTY_FORMAL_COMMUNICATION, studentName: '<script>alert(1)</script>' },
      OPTIONS,
    );
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

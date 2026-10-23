import { describe, expect, it } from 'vitest';
import { limitDefenseFiles, notificationKindLabel, validateGuardianText } from './guardianInbox';

describe('bandeja del encargado', () => {
  it('nombra el acto y exige un texto mínimo', () => {
    expect(notificationKindLabel('FORMAL_CHARGE')).toBe('Comunicación formal');
    expect(validateGuardianText('corto')).toMatch(/10/);
    expect(validateGuardianText('El estudiante no participó en los hechos.')).toBeNull();
  });

  it('admite como máximo 3 adjuntos en el descargo', () => {
    const files = [1, 2, 3, 4].map((id) => new File(['a'], `${id}.pdf`));
    expect(limitDefenseFiles(files).map((file) => file.name)).toEqual(['1.pdf', '2.pdf', '3.pdf']);
  });
});

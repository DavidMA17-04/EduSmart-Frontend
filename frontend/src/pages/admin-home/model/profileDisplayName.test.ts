import { describe, expect, it } from 'vitest';
import { profileDisplayName } from './profileDisplayName';

describe('profileDisplayName', () => {
  it('usa nombre y apellido, nunca el rol', () => {
    expect(
      profileDisplayName({
        name: 'Administrador',
        first_lastname: 'CTP Hojancha',
        email: 'admin@ctphojancha.ed.cr',
        roles: ['ADMIN'],
      }),
    ).toBe('Administrador CTP Hojancha');
    expect(profileDisplayName({ roles: ['ADMIN'], email: 'admin@ctphojancha.ed.cr' })).toBe(
      'admin@ctphojancha.ed.cr',
    );
    expect(profileDisplayName({ roles: ['ADMIN'] })).toBe('Administrador');
  });
});

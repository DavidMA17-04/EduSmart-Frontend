import { afterEach, describe, expect, it } from 'vitest';
import {
  canBrowseAcademicYearHistory,
  filterPeriodsForSessionRole,
} from './academicVisibility';
import { clearAccessToken, setSessionTokens } from './session';

if (typeof globalThis.atob !== 'function') {
  globalThis.atob = (value: string) => Buffer.from(value, 'base64').toString('binary');
}

function memoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
  });
}
if (typeof globalThis.sessionStorage === 'undefined') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: memoryStorage(),
    configurable: true,
  });
}

function encodeJwt(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  return `hdr.${b64}.sig`;
}

const PERIODS = [
  { id: '1', name: '2025', status: 'CLOSED' },
  { id: '2', name: 'I Semestre 2026', status: 'ACTIVE' },
];

afterEach(() => {
  clearAccessToken();
});

describe('academic cycle history visibility', () => {
  it('Administrador y Director ven ciclos cerrados', () => {
    expect(canBrowseAcademicYearHistory(['Administrador'])).toBe(true);
    expect(canBrowseAcademicYearHistory(['Director'])).toBe(true);
    expect(filterPeriodsForSessionRole(PERIODS, ['Administrador'])).toHaveLength(2);
    expect(filterPeriodsForSessionRole(PERIODS, ['Director'])).toHaveLength(2);
  });

  it('Docente y Estudiante solo ven el ciclo ACTIVE', () => {
    expect(canBrowseAcademicYearHistory(['Docente'])).toBe(false);
    expect(canBrowseAcademicYearHistory(['Estudiante'])).toBe(false);
    expect(filterPeriodsForSessionRole(PERIODS, ['Docente']).map((p) => p.id)).toEqual([
      '2',
    ]);
    expect(filterPeriodsForSessionRole(PERIODS, ['Estudiante']).map((p) => p.id)).toEqual([
      '2',
    ]);
  });

  it('sesión JWT de Director no se recorta', () => {
    setSessionTokens(
      encodeJwt({
        sub: 2,
        email: 'director@edusmart.test',
        roles: ['Director'],
        permissions: [],
      }),
    );
    expect(canBrowseAcademicYearHistory()).toBe(true);
    expect(filterPeriodsForSessionRole(PERIODS)).toHaveLength(2);
  });
});

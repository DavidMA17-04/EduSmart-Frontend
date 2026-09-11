import { describe, expect, it } from 'vitest';
import { buildPermissionCode, listExpectedPermissionPairs } from './catalog';
import { buildPermissionMatrix } from './matrix';
import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_MODULE_LABELS,
  PERMISSION_MODULES,
  type Permission,
} from './types';

function stubPermission(
  partial: Pick<Permission, 'id' | 'code' | 'module' | 'action'>,
): Permission {
  return {
    description: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('permission catalog / matrix (D1.1 VIEW_OWN)', () => {
  it('10. PermissionAction VIEW_OWN reconocido', () => {
    expect(PERMISSION_ACTIONS).toContain('VIEW_OWN');
  });

  it('11. label VIEW_OWN', () => {
    expect(PERMISSION_ACTION_LABELS.VIEW_OWN).toBe('Ver propio');
  });

  it('12. SCHEDULES aparece como módulo', () => {
    expect(PERMISSION_MODULES).toContain('SCHEDULES');
    expect(PERMISSION_MODULE_LABELS.SCHEDULES).toBe('Horarios');
  });

  it('13–14. matrix representa VIEW + VIEW_OWN + EDIT sin colisión', () => {
    const permissions = [
      stubPermission({ id: 1, code: 'schedules.view', module: 'SCHEDULES', action: 'VIEW' }),
      stubPermission({
        id: 2,
        code: 'schedules.view_own',
        module: 'SCHEDULES',
        action: 'VIEW_OWN',
      }),
      stubPermission({ id: 3, code: 'schedules.edit', module: 'SCHEDULES', action: 'EDIT' }),
    ];
    const matrix = buildPermissionMatrix(permissions);
    expect(matrix.SCHEDULES.VIEW?.id).toBe(1);
    expect(matrix.SCHEDULES.VIEW_OWN?.id).toBe(2);
    expect(matrix.SCHEDULES.EDIT?.id).toBe(3);
    expect(matrix.SCHEDULES.VIEW?.code).toBe('schedules.view');
    expect(matrix.SCHEDULES.VIEW_OWN?.code).toBe('schedules.view_own');
  });

  it('15. permisos inexistentes no se inventan en matrix', () => {
    const matrix = buildPermissionMatrix([
      stubPermission({ id: 1, code: 'schedules.view', module: 'SCHEDULES', action: 'VIEW' }),
    ]);
    expect(matrix.SCHEDULES.VIEW_OWN).toBeUndefined();
    expect(matrix.SCHEDULES.CREATE).toBeUndefined();
    expect(matrix.SCHEDULES.EDIT).toBeUndefined();
  });

  it('16. buildPermissionCode(SCHEDULES, VIEW_OWN) → schedules.view_own', () => {
    expect(buildPermissionCode('SCHEDULES', 'VIEW_OWN')).toBe('schedules.view_own');
    expect(buildPermissionCode('SCHEDULES', 'VIEW')).toBe('schedules.view');
  });

  it('sync catalog no espera VIEW_OWN ni inventar SCHEDULES', () => {
    const pairs = listExpectedPermissionPairs();
    expect(pairs.some((p) => p.action === 'VIEW_OWN')).toBe(false);
    expect(pairs.some((p) => p.module === 'SCHEDULES')).toBe(false);
    expect(pairs.some((p) => p.module === 'ATTENDANCE' && p.action === 'VIEW')).toBe(true);
  });
});

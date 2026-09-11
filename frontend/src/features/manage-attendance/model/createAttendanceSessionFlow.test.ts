import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/shared/api';
import { attendanceApi } from '../api/attendanceApi';
import {
  buildCreateAttendanceSessionPayload,
  canSubmitCreateAttendanceSession,
  flowErrorMessage,
  formatAttendanceGroupOptionLabel,
  offeringsPanelState,
  resolveSessionPathAfterCreate,
  selectionAfterGroupChange,
  shouldApplyOfferingsResponse,
} from './createAttendanceSessionFlow';

vi.mock('../api/attendanceApi', () => ({
  attendanceApi: {
    listAttendanceGroups: vi.fn(),
    getAvailableOfferings: vi.fn(),
    createAttendanceSession: vi.fn(),
  },
}));

const mockedApi = vi.mocked(attendanceApi);

describe('createAttendanceSessionFlow', () => {
  it('1. carga de groups usa listAttendanceGroups', async () => {
    mockedApi.listAttendanceGroups.mockResolvedValueOnce([
      { groupId: 3, name: '7-1', gradeLevel: 7, sectionId: 2 },
    ]);
    await expect(attendanceApi.listAttendanceGroups()).resolves.toHaveLength(1);
    expect(mockedApi.listAttendanceGroups).toHaveBeenCalledWith();
  });

  it('2. selección de grupo produce getAvailableOfferings(groupId)', async () => {
    mockedApi.getAvailableOfferings.mockResolvedValueOnce([]);
    await attendanceApi.getAvailableOfferings(3);
    expect(mockedApi.getAvailableOfferings).toHaveBeenCalledWith(3);
  });

  it('3. cambio de grupo limpia offering anterior', () => {
    expect(selectionAfterGroupChange(5)).toEqual({
      selectedGroupId: 5,
      selectedTeachingAssignmentId: null,
    });
  });

  it('4. empty groups label helper still works for real rows', () => {
    expect(
      formatAttendanceGroupOptionLabel({
        groupId: 1,
        name: '7-1',
        gradeLevel: 7,
        sectionId: 1,
      }),
    ).toBe('7-1 · Séptimo');
  });

  it('5. empty offerings es distinto de loading', () => {
    expect(
      offeringsPanelState({
        selectedGroupId: 3,
        loading: false,
        error: null,
        offeringsCount: 0,
      }),
    ).toBe('empty');
  });

  it('6. offerings error no se interpreta como empty', () => {
    expect(
      offeringsPanelState({
        selectedGroupId: 3,
        loading: false,
        error: 'Fallo de red',
        offeringsCount: 0,
      }),
    ).toBe('error');
  });

  it('7. no puede crear sin grupo', () => {
    expect(
      canSubmitCreateAttendanceSession({
        groupId: null,
        teachingAssignmentId: 4,
        groupsLoading: false,
        offeringsLoading: false,
        creating: false,
      }),
    ).toBe(false);
  });

  it('8. no puede crear sin offering', () => {
    expect(
      canSubmitCreateAttendanceSession({
        groupId: 3,
        teachingAssignmentId: null,
        groupsLoading: false,
        offeringsLoading: false,
        creating: false,
      }),
    ).toBe(false);
  });

  it('9. payload create { groupId, teachingAssignmentId }', () => {
    expect(buildCreateAttendanceSessionPayload(3, 4)).toEqual({
      groupId: 3,
      teachingAssignmentId: 4,
    });
  });

  it('10. resultado { id: 12 } → /admin/attendance/sessions/12', () => {
    expect(resolveSessionPathAfterCreate({ id: 12 })).toBe(
      '/admin/attendance/sessions/12',
    );
  });

  it('11. NO usa sessionId del mutation result', () => {
    expect(
      resolveSessionPathAfterCreate({ id: 12, sessionId: 999 }),
    ).toBe('/admin/attendance/sessions/12');
  });

  it('12. error create conserva selección (payload sigue válido)', () => {
    const payload = buildCreateAttendanceSessionPayload(3, 4);
    const message = flowErrorMessage(
      new HttpError(403, 'Sin permiso'),
      'fallback',
    );
    expect(payload).toEqual({ groupId: 3, teachingAssignmentId: 4 });
    expect(message).toBe('Sin permiso');
    expect(
      canSubmitCreateAttendanceSession({
        groupId: 3,
        teachingAssignmentId: 4,
        groupsLoading: false,
        offeringsLoading: false,
        creating: false,
      }),
    ).toBe(true);
  });

  it('13. protección response stale al cambiar de grupo', () => {
    expect(shouldApplyOfferingsResponse(1, 2)).toBe(false);
    expect(shouldApplyOfferingsResponse(2, 2)).toBe(true);
  });
});

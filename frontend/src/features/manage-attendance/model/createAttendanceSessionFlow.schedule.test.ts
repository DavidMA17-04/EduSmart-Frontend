import { describe, expect, it } from 'vitest';
import type { AttendanceScheduleOccurrence } from '@/entities/attendance';
import { resolveNewAttendanceSlotAction } from './useCreateAttendanceSessionFlow';

function occ(
  patch: Partial<AttendanceScheduleOccurrence>,
): AttendanceScheduleOccurrence {
  return {
    anchorEntryId: 1,
    entryIds: [1],
    teachingAssignmentId: 10,
    startTime: '07:00:00',
    endTime: '07:40:00',
    withinStartWindow: false,
    attendanceSession: null,
    ...patch,
  };
}

describe('resolveNewAttendanceSlotAction', () => {
  it('OPEN → continue', () => {
    expect(
      resolveNewAttendanceSlotAction(
        occ({
          attendanceSession: { id: 5, status: 'OPEN' },
        }),
      ),
    ).toBe('continue');
  });

  it('CLOSED → view', () => {
    expect(
      resolveNewAttendanceSlotAction(
        occ({
          attendanceSession: { id: 5, status: 'CLOSED' },
        }),
      ),
    ).toBe('view');
  });

  it('sin sesión → take (también fuera de ventana, para pruebas)', () => {
    expect(
      resolveNewAttendanceSlotAction(occ({ withinStartWindow: false })),
    ).toBe('take');
  });
});

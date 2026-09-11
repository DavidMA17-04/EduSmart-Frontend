import { describe, expect, it } from 'vitest';
import { allowedOfferingKindsForGrade } from '@/entities/teaching-assignment';
import {
  buildCreatePayload,
  buildUpdatePayload,
  validateTeachingAssignmentForm,
  type TeachingAssignmentFormValues,
} from './formUtils';

const base: TeachingAssignmentFormValues = {
  userId: '5',
  groupId: '3',
  academicPeriodId: '1',
  offeringKind: 'SUBJECT',
  subjectId: '2',
  specialtyId: '',
};

describe('allowedOfferingKindsForGrade (UX)', () => {
  it('7–9: SUBJECT + EXPLORATORY_WORKSHOP', () => {
    expect(allowedOfferingKindsForGrade(7)).toEqual([
      'SUBJECT',
      'EXPLORATORY_WORKSHOP',
    ]);
    expect(allowedOfferingKindsForGrade(9)).toEqual([
      'SUBJECT',
      'EXPLORATORY_WORKSHOP',
    ]);
  });

  it('10–12: SUBJECT + TECHNICAL_SPECIALTY', () => {
    expect(allowedOfferingKindsForGrade(10)).toEqual([
      'SUBJECT',
      'TECHNICAL_SPECIALTY',
    ]);
    expect(allowedOfferingKindsForGrade(12)).toEqual([
      'SUBJECT',
      'TECHNICAL_SPECIALTY',
    ]);
  });

  it('otros grados: vacío', () => {
    expect(allowedOfferingKindsForGrade(6)).toEqual([]);
    expect(allowedOfferingKindsForGrade(null)).toEqual([]);
  });
});

describe('buildCreatePayload XOR', () => {
  it('SUBJECT → subjectId set, specialtyId null', () => {
    expect(buildCreatePayload(base)).toEqual({
      userId: 5,
      groupId: 3,
      offeringKind: 'SUBJECT',
      academicPeriodId: 1,
      subjectId: 2,
      specialtyId: null,
    });
  });

  it('EXPLORATORY_WORKSHOP → specialtyId set, subjectId null', () => {
    expect(
      buildCreatePayload({
        ...base,
        offeringKind: 'EXPLORATORY_WORKSHOP',
        subjectId: '',
        specialtyId: '8',
      }),
    ).toEqual({
      userId: 5,
      groupId: 3,
      offeringKind: 'EXPLORATORY_WORKSHOP',
      academicPeriodId: 1,
      subjectId: null,
      specialtyId: 8,
    });
  });

  it('TECHNICAL_SPECIALTY → specialtyId set, subjectId null', () => {
    expect(
      buildCreatePayload({
        ...base,
        offeringKind: 'TECHNICAL_SPECIALTY',
        subjectId: '',
        specialtyId: '9',
      }),
    ).toMatchObject({
      offeringKind: 'TECHNICAL_SPECIALTY',
      subjectId: null,
      specialtyId: 9,
    });
  });

  it('buildUpdatePayload omite userId/groupId', () => {
    const update = buildUpdatePayload(base);
    expect(update).not.toHaveProperty('userId');
    expect(update).not.toHaveProperty('groupId');
    expect(update).toMatchObject({
      offeringKind: 'SUBJECT',
      subjectId: 2,
      specialtyId: null,
    });
  });
});

describe('validateTeachingAssignmentForm', () => {
  it('exige docente/grupo en create', () => {
    expect(
      validateTeachingAssignmentForm(
        { ...base, userId: '' },
        { requireTeacherAndGroup: true },
      ),
    ).toMatch(/docente/i);
  });

  it('exige materia para SUBJECT', () => {
    expect(
      validateTeachingAssignmentForm(
        { ...base, subjectId: '' },
        { requireTeacherAndGroup: true },
      ),
    ).toMatch(/materia/i);
  });

  it('exige taller para WORKSHOP', () => {
    expect(
      validateTeachingAssignmentForm(
        {
          ...base,
          offeringKind: 'EXPLORATORY_WORKSHOP',
          subjectId: '',
          specialtyId: '',
        },
        { requireTeacherAndGroup: true },
      ),
    ).toMatch(/taller/i);
  });
});

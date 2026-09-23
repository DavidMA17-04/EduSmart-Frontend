import type { AcademicYear } from '@/entities/academic-year';
import type { AcademicPeriod } from '@/entities/academic-period';
import type { Section } from '@/entities/section';
import type { AcademicGroup } from '@/entities/group';

export type WizardStepId = 'year' | 'courses' | 'levels' | 'sections';

export const WIZARD_STEPS: Array<{ id: WizardStepId; label: string; number: number }> = [
  { id: 'year', label: 'Año lectivo', number: 1 },
  { id: 'courses', label: 'Cursos lectivos', number: 2 },
  { id: 'levels', label: 'Niveles', number: 3 },
  { id: 'sections', label: 'Secciones', number: 4 },
];

export type YearDraft = {
  name: string;
  startDate: string;
  endDate: string;
};

export type CourseDraft = {
  name: string;
  startDate: string;
  endDate: string;
};

export type LevelDraft = {
  name: string;
  gradeLevel: string;
  academicPeriodId: string;
  description: string;
};

export type SectionDraft = {
  name: string;
  sectionId: string;
  maxCapacity: string;
  specialtyId: string;
};

export type WizardCreated = {
  year: AcademicYear | null;
  courses: AcademicPeriod[];
  levels: Section[];
  sections: AcademicGroup[];
};

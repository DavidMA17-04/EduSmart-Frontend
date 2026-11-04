import { useCallback, useMemo, useState } from 'react';
import type { AcademicPeriod } from '@/entities/academic-period';
import type { AcademicGroup } from '@/entities/group';
import type { Section } from '@/entities/section';
import type { Specialty } from '@/entities/specialty';
import { academicPeriodApi } from '@/features/manage-academic-period/api/academicPeriodApi';
import { academicYearApi } from '@/features/manage-academic-year';
import { groupApi } from '@/features/manage-group/api/groupApi';
import { sectionApi } from '@/features/manage-section/api/sectionApi';
import { specialtyApi } from '@/features/manage-specialty/api/specialtyApi';
import { HttpError } from '@/shared/api/httpClient';
import { useToast } from '@/shared/ui';
import type {
  CourseDraft,
  LevelDraft,
  SectionDraft,
  WizardCreated,
  WizardStepId,
  YearDraft,
} from './types';
import { WIZARD_STEPS } from './types';

const emptyYear: YearDraft = { name: '', startDate: '', endDate: '' };
const emptyCourse: CourseDraft = { name: '', startDate: '', endDate: '' };
const emptyLevel: LevelDraft = {
  name: '',
  gradeLevel: '',
  academicPeriodId: '',
  description: '',
};
const emptySection: SectionDraft = {
  name: '',
  sectionId: '',
  maxCapacity: '',
  specialtyId: '',
};

function stepIndex(id: WizardStepId): number {
  return WIZARD_STEPS.findIndex((s) => s.id === id);
}

function humanize(error: unknown, fallback: string): string {
  if (error instanceof HttpError) return error.message || fallback;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useAcademicStructureWizard() {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStepId>('year');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmSectionsOpen, setConfirmSectionsOpen] = useState(false);

  const [yearDraft, setYearDraft] = useState<YearDraft>(emptyYear);
  const [courseDraft, setCourseDraft] = useState<CourseDraft>(emptyCourse);
  const [pendingCourses, setPendingCourses] = useState<CourseDraft[]>([]);
  const [levelDraft, setLevelDraft] = useState<LevelDraft>(emptyLevel);
  const [pendingLevels, setPendingLevels] = useState<LevelDraft[]>([]);
  const [sectionDraft, setSectionDraft] = useState<SectionDraft>(emptySection);
  const [pendingSections, setPendingSections] = useState<SectionDraft[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  const [created, setCreated] = useState<WizardCreated>({
    year: null,
    courses: [],
    levels: [],
    sections: [],
  });

  const currentIndex = stepIndex(currentStep);

  const canEnterStep = useCallback(
    (target: WizardStepId): boolean => {
      const targetIdx = stepIndex(target);
      if (targetIdx <= currentIndex) return true;
      if (target === 'courses') return Boolean(created.year);
      if (target === 'levels') return created.courses.length > 0;
      if (target === 'sections') return created.levels.length > 0;
      return true;
    },
    [created.courses.length, created.levels.length, created.year, currentIndex],
  );

  const pendingRequirement = useMemo(() => {
    if (currentStep === 'year' && !created.year) {
      return 'Guarde el año lectivo para continuar.';
    }
    if (currentStep === 'courses' && created.courses.length === 0) {
      return 'Cree al menos un curso lectivo para continuar.';
    }
    if (currentStep === 'levels' && created.levels.length === 0) {
      return 'Cree al menos un nivel para continuar.';
    }
    if (currentStep === 'sections' && created.sections.length === 0 && pendingSections.length === 0) {
      return 'Agregue al menos una sección (con cupo máximo) para finalizar.';
    }
    return null;
  }, [created, currentStep, pendingSections.length]);

  const goToStep = useCallback(
    (target: WizardStepId) => {
      if (!canEnterStep(target)) {
        setError('Complete el paso actual antes de avanzar.');
        return;
      }
      setError(null);
      setCurrentStep(target);
    },
    [canEnterStep],
  );

  const goNext = useCallback(() => {
    const next = WIZARD_STEPS[currentIndex + 1];
    if (!next) return;
    if (currentStep === 'year' && !created.year) {
      setError('Guarde el año lectivo antes de continuar.');
      return;
    }
    if (currentStep === 'courses' && created.courses.length === 0) {
      setError('Cree al menos un curso lectivo antes de continuar.');
      return;
    }
    if (currentStep === 'levels' && created.levels.length === 0) {
      setError('Cree al menos un nivel antes de continuar.');
      return;
    }
    setError(null);
    setCurrentStep(next.id);
  }, [created.courses.length, created.levels.length, created.year, currentIndex, currentStep]);

  const goBack = useCallback(() => {
    const prev = WIZARD_STEPS[currentIndex - 1];
    if (!prev) return;
    setError(null);
    setCurrentStep(prev.id);
  }, [currentIndex]);

  const saveYear = useCallback(async () => {
    if (!yearDraft.name.trim() || !yearDraft.startDate || !yearDraft.endDate) {
      setError('Complete nombre y fechas del año lectivo.');
      return;
    }
    if (yearDraft.endDate < yearDraft.startDate) {
      setError('La fecha de fin debe ser posterior al inicio.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const year = await academicYearApi.create({
        name: yearDraft.name.trim(),
        startDate: yearDraft.startDate,
        endDate: yearDraft.endDate,
      });
      setCreated((prev) => ({ ...prev, year }));
      toast.push('Año lectivo creado.', 'success');
      setCurrentStep('courses');
    } catch (err) {
      setError(humanize(err, 'No se pudo crear el año lectivo.'));
    } finally {
      setIsSaving(false);
    }
  }, [toast, yearDraft]);

  const addPendingCourse = useCallback(() => {
    if (!courseDraft.name.trim() || !courseDraft.startDate || !courseDraft.endDate) {
      setError('Complete los datos del curso lectivo.');
      return;
    }
    if (courseDraft.endDate < courseDraft.startDate) {
      setError('La fecha de fin debe ser posterior al inicio.');
      return;
    }
    setPendingCourses((prev) => [...prev, { ...courseDraft }]);
    setCourseDraft(emptyCourse);
    setError(null);
  }, [courseDraft]);

  const saveCourses = useCallback(async () => {
    if (!created.year) {
      setError('Falta el año lectivo.');
      return;
    }
    const toCreate = pendingCourses.length
      ? pendingCourses
      : courseDraft.name.trim()
        ? [courseDraft]
        : [];
    if (!toCreate.length) {
      setError('Agregue al menos un curso lectivo.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const yearId = created.year.id;
      const createdCourses: AcademicPeriod[] = [];
      for (const draft of toCreate) {
        const course = await academicPeriodApi.create({
          name: draft.name.trim(),
          startDate: draft.startDate,
          endDate: draft.endDate,
          academicYearId: yearId,
        });
        createdCourses.push(course);
      }
      setCreated((prev) => ({
        ...prev,
        courses: [...prev.courses, ...createdCourses],
      }));
      setPendingCourses([]);
      setCourseDraft(emptyCourse);
      toast.push(
        createdCourses.length > 1
          ? `Se crearon ${createdCourses.length} cursos lectivos.`
          : 'Curso lectivo creado.',
        'success',
      );
      setCurrentStep('levels');
    } catch (err) {
      setError(humanize(err, 'No se pudieron crear los cursos lectivos.'));
    } finally {
      setIsSaving(false);
    }
  }, [courseDraft, created.year, pendingCourses, toast]);

  const addPendingLevel = useCallback(() => {
    const grade = Number(levelDraft.gradeLevel);
    if (!levelDraft.name.trim() || !levelDraft.academicPeriodId || !Number.isInteger(grade)) {
      setError('Complete nombre, grado y curso lectivo del nivel.');
      return;
    }
    setPendingLevels((prev) => [...prev, { ...levelDraft }]);
    setLevelDraft((prev) => ({
      ...emptyLevel,
      academicPeriodId: prev.academicPeriodId,
    }));
    setError(null);
  }, [levelDraft]);

  const saveLevels = useCallback(async () => {
    const toCreate = pendingLevels.length
      ? pendingLevels
      : levelDraft.name.trim()
        ? [levelDraft]
        : [];
    if (!toCreate.length) {
      setError('Agregue al menos un nivel.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const createdLevels: Section[] = [];
      for (const draft of toCreate) {
        const level = await sectionApi.create({
          name: draft.name.trim(),
          gradeLevel: Number(draft.gradeLevel),
          academicPeriodId: Number(draft.academicPeriodId),
          description: draft.description.trim() || undefined,
          status: 'ACTIVE',
        });
        createdLevels.push(level);
      }
      setCreated((prev) => ({
        ...prev,
        levels: [...prev.levels, ...createdLevels],
      }));
      setPendingLevels([]);
      setLevelDraft(emptyLevel);
      toast.push(
        createdLevels.length > 1
          ? `Se crearon ${createdLevels.length} niveles.`
          : 'Nivel creado.',
        'success',
      );
      setCurrentStep('sections');
      void specialtyApi.list().then(setSpecialties).catch(() => setSpecialties([]));
    } catch (err) {
      setError(humanize(err, 'No se pudieron crear los niveles.'));
    } finally {
      setIsSaving(false);
    }
  }, [levelDraft, pendingLevels, toast]);

  const addPendingSection = useCallback(() => {
    const capacity = Number(sectionDraft.maxCapacity);
    if (!sectionDraft.name.trim() || !sectionDraft.sectionId || !Number.isFinite(capacity) || capacity < 1) {
      setError('Complete nombre, nivel y cupo máximo (≥ 1) de la sección.');
      return;
    }
    setPendingSections((prev) => [...prev, { ...sectionDraft }]);
    setSectionDraft((prev) => ({
      ...emptySection,
      sectionId: prev.sectionId,
    }));
    setError(null);
  }, [sectionDraft]);

  const requestSaveSections = useCallback(() => {
    const toCreate = pendingSections.length
      ? pendingSections
      : sectionDraft.name.trim()
        ? [sectionDraft]
        : [];
    if (!toCreate.length) {
      setError('Agregue al menos una sección.');
      return;
    }
    setConfirmSectionsOpen(true);
  }, [pendingSections, sectionDraft]);

  const saveSections = useCallback(async () => {
    const toCreate = pendingSections.length
      ? pendingSections
      : sectionDraft.name.trim()
        ? [sectionDraft]
        : [];
    if (!toCreate.length) {
      setError('Agregue al menos una sección.');
      setConfirmSectionsOpen(false);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const createdGroups: AcademicGroup[] = [];
      for (const draft of toCreate) {
        const group = await groupApi.create({
          name: draft.name.trim(),
          maxCapacity: Number(draft.maxCapacity),
          sectionId: Number(draft.sectionId),
          specialtyId: draft.specialtyId ? Number(draft.specialtyId) : null,
        });
        createdGroups.push(group);
      }
      setCreated((prev) => ({
        ...prev,
        sections: [...prev.sections, ...createdGroups],
      }));
      setPendingSections([]);
      setSectionDraft(emptySection);
      setConfirmSectionsOpen(false);
      toast.push(
        createdGroups.length > 1
          ? `Se crearon ${createdGroups.length} secciones.`
          : 'Sección creada.',
        'success',
      );
    } catch (err) {
      setError(humanize(err, 'No se pudieron crear las secciones.'));
      setConfirmSectionsOpen(false);
    } finally {
      setIsSaving(false);
    }
  }, [pendingSections, sectionDraft, toast]);

  return {
    currentStep,
    currentIndex,
    steps: WIZARD_STEPS,
    error,
    isSaving,
    pendingRequirement,
    canEnterStep,
    goToStep,
    goNext,
    goBack,
    yearDraft,
    setYearDraft,
    saveYear,
    courseDraft,
    setCourseDraft,
    pendingCourses,
    addPendingCourse,
    removePendingCourse: (index: number) =>
      setPendingCourses((prev) => prev.filter((_, i) => i !== index)),
    saveCourses,
    levelDraft,
    setLevelDraft,
    pendingLevels,
    addPendingLevel,
    removePendingLevel: (index: number) =>
      setPendingLevels((prev) => prev.filter((_, i) => i !== index)),
    saveLevels,
    sectionDraft,
    setSectionDraft,
    pendingSections,
    addPendingSection,
    removePendingSection: (index: number) =>
      setPendingSections((prev) => prev.filter((_, i) => i !== index)),
    requestSaveSections,
    saveSections,
    confirmSectionsOpen,
    setConfirmSectionsOpen,
    created,
    specialties,
  };
}

export type AcademicStructureWizardModel = ReturnType<typeof useAcademicStructureWizard>;

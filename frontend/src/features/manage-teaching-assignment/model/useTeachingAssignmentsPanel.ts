import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AcademicPeriod } from '@/entities/academic-period';
import type { AcademicGroup, GuideTeacher } from '@/entities/group';
import type { Specialty } from '@/entities/specialty';
import type {
  AcademicOfferingKind,
  SubjectCatalogItem,
  TeachingAssignment,
} from '@/entities/teaching-assignment';
import {
  allowedOfferingKindsForGrade,
} from '@/entities/teaching-assignment';
import { academicPeriodApi } from '@/features/manage-academic-period/api/academicPeriodApi';
import { groupApi } from '@/features/manage-group/api/groupApi';
import { guideTeacherApi } from '@/features/manage-group/api/guideTeacherApi';
import { specialtyApi } from '@/features/manage-specialty/api/specialtyApi';
import { HttpError } from '@/shared/api/httpClient';
import { useToast } from '@/shared/ui';
import {
  subjectApi,
  teachingAssignmentApi,
} from '../api/teachingAssignmentApi';
import {
  buildCreatePayload,
  buildUpdatePayload,
  EMPTY_TEACHING_ASSIGNMENT_FORM,
  type TeachingAssignmentFormValues,
  validateTeachingAssignmentForm,
} from './formUtils';

export type OfferingKindFilter = AcademicOfferingKind | 'ALL';

function teacherDisplayName(teacher: GuideTeacher): string {
  return teacher.name || teacher.email || `Docente #${teacher.id}`;
}

function assignmentTeacherName(row: TeachingAssignment): string {
  const u = row.user;
  if (!u) return `Docente #${row.userId}`;
  const composed = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return composed || u.name?.trim() || u.email || `Docente #${row.userId}`;
}

function humanizeMutationError(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 409) {
      return 'Ya existe una asignación académica para este docente, grupo, oferta y período.';
    }
    if (error.status === 400) {
      const msg = error.message ?? '';
      if (msg.includes('OFFERING_KIND_NOT_ELIGIBLE') || msg.includes('not allowed for grade')) {
        return 'Ese tipo de oferta no es válido para el grado del grupo seleccionado.';
      }
      if (msg.includes('OFFERING_SPECIALTY_KIND') || msg.includes('kind mismatch')) {
        return 'La especialidad o taller no coincide con el tipo de oferta seleccionado.';
      }
      return msg || 'No se pudo guardar la asignación.';
    }
    return error.message || 'No se pudo completar la solicitud.';
  }
  if (error instanceof Error) return error.message;
  return 'No se pudo completar la solicitud.';
}

export function useTeachingAssignmentsPanel() {
  const toast = useToast();

  const [rows, setRows] = useState<TeachingAssignment[]>([]);
  const [teachers, setTeachers] = useState<GuideTeacher[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [subjects, setSubjects] = useState<SubjectCatalogItem[]>([]);
  const [workshops, setWorkshops] = useState<Specialty[]>([]);
  const [technicals, setTechnicals] = useState<Specialty[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [filterTeacherId, setFilterTeacherId] = useState('');
  const [filterGroupId, setFilterGroupId] = useState('');
  const [filterPeriodId, setFilterPeriodId] = useState('');
  const [filterKind, setFilterKind] = useState<OfferingKindFilter>('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TeachingAssignmentFormValues>(
    EMPTY_TEACHING_ASSIGNMENT_FORM,
  );

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const [teacherList, groupList, periodList, subjectList, workshopList, techList] =
        await Promise.all([
          guideTeacherApi.list(),
          groupApi.list(),
          academicPeriodApi.list(),
          subjectApi.list(),
          specialtyApi.list('EXPLORATORY_WORKSHOP'),
          specialtyApi.list('TECHNICAL_SPECIALTY'),
        ]);
      setTeachers(teacherList);
      setGroups(groupList);
      setPeriods(periodList);
      setSubjects(subjectList.filter((s) => s.status === 'ACTIVE'));
      setWorkshops(workshopList.filter((s) => s.status === 'ACTIVE'));
      setTechnicals(techList.filter((s) => s.status === 'ACTIVE'));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar los catálogos.',
      );
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {
        teacherId: filterTeacherId ? Number(filterTeacherId) : undefined,
        groupId: filterGroupId ? Number(filterGroupId) : undefined,
        periodId: filterPeriodId ? Number(filterPeriodId) : undefined,
      };
      const data = await teachingAssignmentApi.list(filters);
      setRows(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las asignaciones académicas.',
      );
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterTeacherId, filterGroupId, filterPeriodId]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const selectedGroup = useMemo(
    () => groups.find((g) => String(g.id) === form.groupId) ?? null,
    [groups, form.groupId],
  );

  const gradeLevel = selectedGroup?.section?.gradeLevel ?? null;

  const allowedKinds = useMemo(
    () => allowedOfferingKindsForGrade(gradeLevel),
    [gradeLevel],
  );

  const offeringOptions = useMemo(() => {
    if (form.offeringKind === 'SUBJECT') return subjects;
    if (form.offeringKind === 'EXPLORATORY_WORKSHOP') return workshops;
    if (form.offeringKind === 'TECHNICAL_SPECIALTY') return technicals;
    return [];
  }, [form.offeringKind, subjects, workshops, technicals]);

  const visibleRows = useMemo(() => {
    if (filterKind === 'ALL') return rows;
    return rows.filter((row) => row.offeringKind === filterKind);
  }, [rows, filterKind]);

  const patchForm = useCallback(
    (patch: Partial<TeachingAssignmentFormValues>) => {
      setForm((prev) => {
        const next = { ...prev, ...patch };
        if (patch.groupId !== undefined && patch.groupId !== prev.groupId) {
          next.offeringKind = '';
          next.subjectId = '';
          next.specialtyId = '';
          const group = groups.find((g) => String(g.id) === patch.groupId);
          if (group?.academicPeriodId && !next.academicPeriodId) {
            next.academicPeriodId = String(group.academicPeriodId);
          }
        }
        if (patch.offeringKind !== undefined && patch.offeringKind !== prev.offeringKind) {
          next.subjectId = '';
          next.specialtyId = '';
        }
        return next;
      });
      setMutationError(null);
    },
    [groups],
  );

  const openCreate = useCallback(() => {
    setDialogMode('create');
    setEditingId(null);
    setForm(EMPTY_TEACHING_ASSIGNMENT_FORM);
    setMutationError(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row: TeachingAssignment) => {
    setDialogMode('edit');
    setEditingId(row.id);
    setForm({
      userId: String(row.userId),
      groupId: String(row.groupId),
      academicPeriodId: row.academicPeriodId != null ? String(row.academicPeriodId) : '',
      offeringKind: row.offeringKind,
      subjectId: row.subjectId != null ? String(row.subjectId) : '',
      specialtyId: row.specialtyId != null ? String(row.specialtyId) : '',
    });
    setMutationError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    if (isSaving) return;
    setDialogOpen(false);
    setEditingId(null);
    setMutationError(null);
  }, [isSaving]);

  const submit = useCallback(async () => {
    const validation = validateTeachingAssignmentForm(form, {
      requireTeacherAndGroup: dialogMode === 'create',
    });
    if (validation) {
      setMutationError(validation);
      return;
    }
    if (dialogMode === 'create' && form.offeringKind && !allowedKinds.includes(form.offeringKind)) {
      setMutationError(
        'Ese tipo de oferta no es válido para el grado del grupo seleccionado.',
      );
      return;
    }

    setIsSaving(true);
    setMutationError(null);
    try {
      if (dialogMode === 'create') {
        await teachingAssignmentApi.create(buildCreatePayload(form));
        toast.push('Asignación académica creada.', 'success');
      } else if (editingId != null) {
        await teachingAssignmentApi.update(editingId, buildUpdatePayload(form));
        toast.push('Asignación académica actualizada.', 'success');
      }
      setDialogOpen(false);
      await loadAssignments();
    } catch (err) {
      setMutationError(humanizeMutationError(err));
    } finally {
      setIsSaving(false);
    }
  }, [
    form,
    dialogMode,
    allowedKinds,
    editingId,
    loadAssignments,
    toast,
  ]);

  return {
    rows: visibleRows,
    teachers,
    groups,
    periods,
    subjects,
    workshops,
    technicals,
    offeringOptions,
    isLoading: isLoading || catalogLoading,
    error,
    mutationError,
    isSaving,
    filterTeacherId,
    setFilterTeacherId,
    filterGroupId,
    setFilterGroupId,
    filterPeriodId,
    setFilterPeriodId,
    filterKind,
    setFilterKind,
    dialogOpen,
    dialogMode,
    form,
    patchForm,
    gradeLevel,
    allowedKinds,
    selectedGroup,
    openCreate,
    openEdit,
    closeDialog,
    submit,
    teacherDisplayName,
    assignmentTeacherName,
    canEdit: true,
  };
}

export type TeachingAssignmentsPanelModel = ReturnType<
  typeof useTeachingAssignmentsPanel
>;

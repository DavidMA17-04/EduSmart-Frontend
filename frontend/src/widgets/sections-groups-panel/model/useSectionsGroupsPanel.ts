import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AcademicGroup, GuideTeacher } from '@/entities/group';
import type { AcademicPeriod, Section } from '@/entities/section';
import type { Specialty } from '@/entities/specialty';
import {
  useGroupForm,
  useGroups,
  useGuideTeacherForm,
  useGuideTeachers,
  useManageGroup,
  useManageGuideTeacher,
} from '@/features/manage-group';
import { academicPeriodApi, useManageSection, useSectionForm, useSections } from '@/features/manage-section';
import { specialtyApi } from '@/features/manage-specialty';

export type PanelTab = 'niveles' | 'grupos' | 'docentes';
type FormMode = 'create' | 'edit';
type TeacherFilter = 'all' | 'unassigned' | string;

function parsePanelTab(value: string | null): PanelTab {
  if (value === 'grupos' || value === 'docentes' || value === 'niveles') return value;
  return 'niveles';
}

export function useSectionsGroupsPanel() {
  const {
    sections,
    reload: reloadSections,
    removeSection,
    isLoading: isLoadingSections,
    error: sectionsError,
  } = useSections();
  const {
    groups,
    reload: reloadGroups,
    removeGroup: removeGroupFromState,
    upsertGroup,
    isLoading: isLoadingGroups,
    error: groupsError,
  } = useGroups();

  const guideTeachersState = useGuideTeachers();

  const reloadAll = useCallback(async () => {
    await Promise.all([reloadSections(true), reloadGroups(true)]);
  }, [reloadGroups, reloadSections]);

  const refreshGroups = useCallback(async () => {
    await reloadGroups(true);
  }, [reloadGroups]);

  const {
    create: createSection,
    update: updateSection,
    deactivate: deactivateSection,
    error: sectionMutationError,
    isSubmitting: isSectionSubmitting,
  } = useManageSection(reloadAll);

  const {
    create: createGroup,
    update: updateGroup,
    assignGuideTeacher,
    remove: removeGroup,
    error: groupMutationError,
    isSubmitting: isGroupSubmitting,
  } = useManageGroup(refreshGroups);

  const {
    create: createGuideTeacher,
    update: updateGuideTeacherRecord,
    remove: removeGuideTeacherRecord,
    error: teacherMutationError,
    isSubmitting: isTeacherSubmitting,
  } = useManageGuideTeacher();

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<PanelTab>(() => parsePanelTab(searchParams.get('tab')));
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [sectionDialogMode, setSectionDialogMode] = useState<FormMode | null>(null);
  const [groupFormMode, setGroupFormMode] = useState<FormMode | null>(null);
  const [teacherFormMode, setTeacherFormMode] = useState<FormMode | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<number>>(new Set());
  const [groupSectionFilter, setGroupSectionFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>('all');
  const [pendingTeachers, setPendingTeachers] = useState<Record<number, string>>({});
  const [savingGroupId, setSavingGroupId] = useState<number | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);

  useEffect(() => {
    void specialtyApi.list().then(setSpecialties).catch(() => setSpecialties([]));
    void academicPeriodApi.list().then(setAcademicPeriods).catch(() => setAcademicPeriods([]));
  }, []);

  const groupsBySection = useMemo(() => {
    const map = new Map<number, AcademicGroup[]>();
    for (const group of groups) {
      const list = map.get(group.sectionId) ?? [];
      list.push(group);
      map.set(group.sectionId, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [groups]);

  const sectionsWithGroups = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        groups: groupsBySection.get(section.id) ?? section.groups ?? [],
      })),
    [groupsBySection, sections],
  );

  const selectedSection = useMemo(
    () => sectionsWithGroups.find((section) => section.id === selectedSectionId),
    [sectionsWithGroups, selectedSectionId],
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId],
  );

  const selectedTeacher = useMemo(
    () => guideTeachersState.guideTeachers.find((teacher) => teacher.id === selectedTeacherId),
    [guideTeachersState.guideTeachers, selectedTeacherId],
  );

  const groupsForSelectedSection = useMemo(
    () => (selectedSectionId ? groupsBySection.get(selectedSectionId) ?? [] : []),
    [groupsBySection, selectedSectionId],
  );

  const sectionForm = useSectionForm(sectionDialogMode === 'edit' ? selectedSection : undefined);
  const groupForm = useGroupForm(groupFormMode === 'edit' ? selectedGroup : undefined);
  const teacherForm = useGuideTeacherForm(teacherFormMode === 'edit' ? selectedTeacher : undefined);

  useEffect(() => {
    if (groupFormMode === 'create' && selectedSectionId) {
      groupForm.setField('sectionId', String(selectedSectionId));
    }
  }, [groupForm, groupFormMode, selectedSectionId]);

  const getSectionInfo = useCallback(
    (sectionId: number) => {
      const section = sections.find((item) => item.id === sectionId);
      if (section) return { code: String(section.gradeLevel), name: section.name };
      const group = groups.find((item) => item.sectionId === sectionId);
      if (group?.section) return { code: String(group.section.gradeLevel ?? ''), name: group.section.name };
      return { code: String(sectionId), name: '—' };
    },
    [groups, sections],
  );

  const getSectionCode = useCallback(
    (sectionId: number) => getSectionInfo(sectionId).code,
    [getSectionInfo],
  );

  const getSectionName = useCallback(
    (sectionId: number) => getSectionInfo(sectionId).name,
    [getSectionInfo],
  );

  const getSectionLabel = useCallback(
    (sectionId: number) => {
      const { code, name } = getSectionInfo(sectionId);
      return `${code} - ${name}`;
    },
    [getSectionInfo],
  );

  const filteredGroups = useMemo(() => {
    if (!groupSectionFilter) return groups;
    return groups.filter((group) => String(group.sectionId) === groupSectionFilter);
  }, [groupSectionFilter, groups]);

  const assignmentGroups = useMemo(() => {
    let list = groups;
    if (teacherFilter === 'unassigned') {
      list = list.filter((group) => !group.guideTeacherId);
    } else if (teacherFilter !== 'all') {
      list = list.filter((group) => String(group.sectionId) === teacherFilter);
    }
    return list;
  }, [groups, teacherFilter]);

  const assignmentsByTeacherId = useMemo(() => {
    const map = new Map<number, AcademicGroup[]>();
    for (const group of groups) {
      if (group.guideTeacherId == null) continue;
      const list = map.get(group.guideTeacherId) ?? [];
      list.push(group);
      map.set(group.guideTeacherId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }
    return map;
  }, [groups]);

  const selectSection = useCallback((id: number) => {
    setSelectedSectionId(id);
    setGroupFormMode(null);
    setSelectedGroupId(null);
  }, []);

  const openCreateSectionDialog = useCallback(() => {
    setSelectedSectionId(null);
    setSectionDialogMode('create');
    setGroupFormMode(null);
    setSelectedGroupId(null);
  }, []);

  const openEditSectionDialog = useCallback((id: number) => {
    setSelectedSectionId(id);
    setSectionDialogMode('edit');
    setGroupFormMode(null);
    setSelectedGroupId(null);
  }, []);

  const closeSectionDialog = useCallback(() => {
    setSectionDialogMode(null);
  }, []);

  /** @deprecated Prefer openCreateSectionDialog — kept for primary action helpers */
  const createSectionMode = openCreateSectionDialog;

  const createGroupMode = useCallback((sectionId?: number | string) => {
    setSelectedGroupId(null);
    setGroupFormMode('create');
    if (sectionId) {
      setSelectedSectionId(Number(sectionId));
    }
  }, []);

  const openEditGroupDialog = useCallback((id: number) => {
    setSelectedGroupId(id);
    setGroupFormMode('edit');
    const group = groups.find((item) => item.id === id);
    if (group) setSelectedSectionId(group.sectionId);
  }, [groups]);

  const selectGroup = useCallback((id: number) => {
    setSelectedGroupId(id);
    setGroupFormMode(null);
    const group = groups.find((item) => item.id === id);
    if (group) setSelectedSectionId(group.sectionId);
  }, [groups]);

  const closeGroupDialog = useCallback(() => {
    setGroupFormMode(null);
  }, []);

  const toggleSectionExpanded = useCallback((id: number) => {
    setExpandedSectionIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const submitSection = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = sectionForm.toPayload();
      if (!payload.name || !payload.academicPeriodId) return;
      try {
        if (sectionDialogMode === 'create') {
          const created = await createSection(payload);
          setSelectedSectionId(created.id);
          setSectionDialogMode(null);
        } else if (selectedSection) {
          await updateSection(selectedSection.id, payload);
          setSectionDialogMode(null);
        }
      } catch {
        // El hook de mutaciones expone el error para la interfaz.
      }
    },
    [createSection, sectionDialogMode, sectionForm, selectedSection, updateSection],
  );

  const submitGroup = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = groupForm.toPayload();
      if (!payload.name || !payload.sectionId) return;
      try {
        if (groupFormMode === 'create') {
          const created = await createGroup(payload);
          setSelectedGroupId(created.id);
          setSelectedSectionId(created.sectionId);
          setGroupFormMode(null);
        } else if (selectedGroup) {
          await updateGroup(selectedGroup.id, payload);
          setGroupFormMode(null);
        }
      } catch {
        // El hook de mutaciones expone el error para la interfaz.
      }
    },
    [createGroup, groupForm, groupFormMode, selectedGroup, updateGroup],
  );

  const deactivateSelectedSection = useCallback(
    async (section: Section) => {
      if (!window.confirm(`¿Inactivar el nivel ${section.name}?`)) return;
      try {
        await deactivateSection(section.id);
        removeSection(section.id);
        if (selectedSectionId === section.id) {
          setSelectedSectionId(null);
          setSectionDialogMode(null);
        }
      } catch {
        // El error se expone desde el hook.
      }
    },
    [deactivateSection, removeSection, selectedSectionId],
  );

  const removeSelectedGroup = useCallback(
    async (group: AcademicGroup) => {
      if (!window.confirm(`¿Eliminar la sección ${group.name}?`)) return;
      try {
        await removeGroup(group.id);
        removeGroupFromState(group.id);
        if (selectedGroupId === group.id) {
          setSelectedGroupId(null);
          setGroupFormMode(null);
        }
      } catch {
        // El error se expone desde el hook.
      }
    },
    [removeGroup, removeGroupFromState, selectedGroupId],
  );

  const createTeacherMode = useCallback(() => {
    setSelectedTeacherId(null);
    setTeacherFormMode('create');
  }, []);

  const selectTeacher = useCallback((id: number) => {
    setSelectedTeacherId(id);
    setTeacherFormMode(null);
  }, []);

  const openEditTeacherDialog = useCallback((id: number) => {
    setSelectedTeacherId(id);
    setTeacherFormMode('edit');
  }, []);

  const closeTeacherDialog = useCallback(() => {
    setTeacherFormMode(null);
  }, []);

  const cancelTeacherForm = closeTeacherDialog;

  const submitTeacher = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!teacherForm.validate()) return;
      const payload = teacherForm.toPayload();
      try {
        if (teacherFormMode === 'create') {
          const created = await createGuideTeacher(payload);
          guideTeachersState.upsert(created);
          setSelectedTeacherId(created.id);
          setTeacherFormMode(null);
        } else if (selectedTeacher) {
          const updated = await updateGuideTeacherRecord(selectedTeacher.id, payload);
          guideTeachersState.upsert(updated);
          setTeacherFormMode(null);
        }
      } catch {
        // El hook de mutaciones expone el error para la interfaz.
      }
    },
    [createGuideTeacher, guideTeachersState, selectedTeacher, teacherForm, teacherFormMode, updateGuideTeacherRecord],
  );

  const removeSelectedTeacher = useCallback(
    async (teacher: GuideTeacher) => {
      if (!window.confirm(`¿Eliminar al docente ${teacher.name}? Se inactivará y se quitará de las secciones asignadas.`)) return;
      try {
        await removeGuideTeacherRecord(teacher.id);
        guideTeachersState.remove(teacher.id);
        await reloadGroups(true);
        if (selectedTeacherId === teacher.id) {
          setSelectedTeacherId(null);
          setTeacherFormMode(null);
        }
      } catch {
        // El error se expone desde el hook.
      }
    },
    [guideTeachersState, reloadGroups, removeGuideTeacherRecord, selectedTeacherId],
  );

  const setPendingTeacher = useCallback((groupId: number, teacherId: string) => {
    setPendingTeachers((current) => ({ ...current, [groupId]: teacherId }));
  }, []);

  const submitGuideTeacher = useCallback(
    async (groupId: number) => {
      const group = groups.find((item) => item.id === groupId);
      if (!group) return;

      const currentTeacherId = group.guideTeacherId == null ? '' : String(group.guideTeacherId);
      const teacherId = pendingTeachers[groupId] ?? currentTeacherId;
      if (teacherId === currentTeacherId) return;

      setSavingGroupId(groupId);
      try {
        const updated = await assignGuideTeacher(groupId, {
          guideTeacherId: teacherId ? Number(teacherId) : null,
        });
        upsertGroup(updated);
        setPendingTeachers((current) => {
          const next = { ...current };
          delete next[groupId];
          return next;
        });
      } catch {
        // El error se expone desde el hook.
      } finally {
        setSavingGroupId(null);
      }
    },
    [assignGuideTeacher, groups, pendingTeachers, upsertGroup],
  );

  const handlePrimaryAction = useCallback(() => {
    if (activeTab === 'niveles') {
      createSectionMode();
      return;
    }
    if (activeTab === 'grupos') {
      createGroupMode(groupSectionFilter || selectedSectionId || undefined);
      return;
    }
    createTeacherMode();
  }, [activeTab, createGroupMode, createSectionMode, createTeacherMode, groupSectionFilter, selectedSectionId]);

  const cancelGroupForm = closeGroupDialog;

  const isLoading = isLoadingSections || isLoadingGroups || guideTeachersState.isLoading;
  const loadError = sectionsError ?? groupsError ?? guideTeachersState.error;

  return {
    activeTab,
    setActiveTab,
    sections: sectionsWithGroups,
    groups,
    filteredGroups,
    assignmentGroups,
    assignmentsByTeacherId,
    groupsForSelectedSection,
    selectedSection,
    selectedSectionId,
    selectedGroup,
    selectedGroupId,
    selectedTeacher,
    selectedTeacherId,
    sectionDialogMode,
    groupFormMode,
    teacherFormMode,
    expandedSectionIds,
    groupSectionFilter,
    setGroupSectionFilter,
    teacherFilter,
    setTeacherFilter,
    pendingTeachers,
    guideTeachers: guideTeachersState.guideTeachers,
    guideTeachersError: guideTeachersState.error,
    sectionForm: { values: sectionForm.values, setField: sectionForm.setField, submit: submitSection },
    groupForm: { values: groupForm.values, setField: groupForm.setField, submit: submitGroup },
    teacherForm: { values: teacherForm.values, errors: teacherForm.errors, setField: teacherForm.setField, submit: submitTeacher },
    selectSection,
    createSectionMode,
    openCreateSectionDialog,
    openEditSectionDialog,
    closeSectionDialog,
    createGroupMode,
    openEditGroupDialog,
    closeGroupDialog,
    selectGroup,
    createTeacherMode,
    openEditTeacherDialog,
    closeTeacherDialog,
    selectTeacher,
    cancelTeacherForm,
    removeSelectedTeacher,
    toggleSectionExpanded,
    deactivateSelectedSection,
    removeSelectedGroup,
    setPendingTeacher,
    submitGuideTeacher,
    handlePrimaryAction,
    cancelGroupForm,
    cancelSectionForm: closeSectionDialog,
    getSectionCode,
    getSectionName,
    getSectionLabel,
    isLoading,
    loadError,
    sectionMutationError,
    groupMutationError,
    isSectionSubmitting,
    isGroupSubmitting,
    isTeacherSubmitting,
    teacherMutationError,
    savingGroupId,
    specialties,
    academicPeriods,
  };
}

export type SectionsGroupsPanelModel = ReturnType<typeof useSectionsGroupsPanel>;

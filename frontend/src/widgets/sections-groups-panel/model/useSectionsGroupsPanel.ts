import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AcademicGroup } from '@/entities/group';
import type { Section } from '@/entities/section';
import { MOCK_GUIDE_TEACHERS, useGroupForm, useGroups, useGuideTeachers, useManageGroup } from '@/features/manage-group';
import { useManageSection, useSectionForm, useSections } from '@/features/manage-section';

export type PanelTab = 'niveles' | 'grupos' | 'docentes';
type FormMode = 'create' | 'edit';
type TeacherFilter = 'all' | 'unassigned' | string;

export function useSectionsGroupsPanel() {
  const sectionsState = useSections();
  const groupsState = useGroups();
  const guideTeachersState = useGuideTeachers();

  const reloadSections = sectionsState.reload;
  const reloadGroups = groupsState.reload;

  const reloadAll = useCallback(async () => {
    await Promise.all([reloadSections(), reloadGroups()]);
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

  const [activeTab, setActiveTab] = useState<PanelTab>('niveles');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [sectionFormMode, setSectionFormMode] = useState<FormMode>('create');
  const [groupFormMode, setGroupFormMode] = useState<FormMode | null>(null);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(new Set());
  const [groupSectionFilter, setGroupSectionFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>('all');
  const [pendingTeachers, setPendingTeachers] = useState<Record<string, string>>({});
  const [savingGroupId, setSavingGroupId] = useState<string | null>(null);

  const groupsBySection = useMemo(() => {
    const map = new Map<string, AcademicGroup[]>();
    for (const group of groupsState.groups) {
      const list = map.get(group.sectionId) ?? [];
      list.push(group);
      map.set(group.sectionId, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [groupsState.groups]);

  const sectionsWithGroups = useMemo(
    () =>
      sectionsState.sections.map((section) => ({
        ...section,
        groups: groupsBySection.get(section.id) ?? section.groups ?? [],
      })),
    [groupsBySection, sectionsState.sections],
  );

  const selectedSection = useMemo(
    () => sectionsWithGroups.find((section) => section.id === selectedSectionId),
    [sectionsWithGroups, selectedSectionId],
  );

  const selectedGroup = useMemo(
    () => groupsState.groups.find((group) => group.id === selectedGroupId),
    [groupsState.groups, selectedGroupId],
  );

  const groupsForSelectedSection = useMemo(
    () => (selectedSectionId ? groupsBySection.get(selectedSectionId) ?? [] : []),
    [groupsBySection, selectedSectionId],
  );

  const sectionForm = useSectionForm(sectionFormMode === 'edit' ? selectedSection : undefined);
  const groupForm = useGroupForm(groupFormMode === 'edit' ? selectedGroup : undefined);

  useEffect(() => {
    if (groupFormMode === 'create' && selectedSectionId && activeTab === 'niveles') {
      groupForm.setField('sectionId', selectedSectionId);
    }
  }, [activeTab, groupForm, groupFormMode, selectedSectionId]);

  const getSectionLabel = useCallback(
    (sectionId: string) => {
      const section = sectionsState.sections.find((item) => item.id === sectionId);
      if (section) return `${section.code} - ${section.name}`;
      const group = groupsState.groups.find((item) => item.sectionId === sectionId);
      if (group?.section) return `${group.section.code} - ${group.section.name}`;
      return sectionId;
    },
    [groupsState.groups, sectionsState.sections],
  );

  const filteredGroups = useMemo(() => {
    if (!groupSectionFilter) return groupsState.groups;
    return groupsState.groups.filter((group) => group.sectionId === groupSectionFilter);
  }, [groupSectionFilter, groupsState.groups]);

  const assignmentGroups = useMemo(() => {
    let list = groupsState.groups;
    if (teacherFilter === 'unassigned') {
      list = list.filter((group) => !group.guideTeacherId);
    } else if (teacherFilter !== 'all') {
      list = list.filter((group) => group.sectionId === teacherFilter);
    }
    return list;
  }, [groupsState.groups, teacherFilter]);

  const selectSection = useCallback((id: string) => {
    setSelectedSectionId(id);
    setSectionFormMode('edit');
    setGroupFormMode(null);
    setSelectedGroupId(null);
  }, []);

  const createSectionMode = useCallback(() => {
    setSelectedSectionId(null);
    setSectionFormMode('create');
    setGroupFormMode(null);
    setSelectedGroupId(null);
  }, []);

  const createGroupMode = useCallback((sectionId?: string) => {
    setSelectedGroupId(null);
    setGroupFormMode('create');
    if (sectionId) {
      setSelectedSectionId(sectionId);
      setSectionFormMode('edit');
    }
  }, []);

  const selectGroup = useCallback((id: string) => {
    setSelectedGroupId(id);
    setGroupFormMode('edit');
    const group = groupsState.groups.find((item) => item.id === id);
    if (group) setSelectedSectionId(group.sectionId);
  }, [groupsState.groups]);

  const toggleSectionExpanded = useCallback((id: string) => {
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
      if (!payload.code || !payload.name) return;
      try {
        if (sectionFormMode === 'create') {
          const created = await createSection(payload);
          setSelectedSectionId(created.id);
          setSectionFormMode('edit');
        } else if (selectedSection) {
          await updateSection(selectedSection.id, payload);
        }
      } catch {
        // El hook de mutaciones expone el error para la interfaz.
      }
    },
    [createSection, sectionForm, sectionFormMode, selectedSection, updateSection],
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
          setGroupFormMode('edit');
          setSelectedSectionId(created.sectionId);
          setSectionFormMode('edit');
        } else if (selectedGroup) {
          await updateGroup(selectedGroup.id, payload);
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
        if (selectedSectionId === section.id) {
          setSelectedSectionId(null);
          setSectionFormMode('create');
        }
      } catch {
        // El error se expone desde el hook.
      }
    },
    [deactivateSection, selectedSectionId],
  );

  const removeSelectedGroup = useCallback(
    async (group: AcademicGroup) => {
      if (!window.confirm(`¿Eliminar el grupo ${group.name}?`)) return;
      try {
        await removeGroup(group.id);
        if (selectedGroupId === group.id) {
          setSelectedGroupId(null);
          setGroupFormMode(null);
        }
      } catch {
        // El error se expone desde el hook.
      }
    },
    [removeGroup, selectedGroupId],
  );

  const setPendingTeacher = useCallback((groupId: string, teacherId: string) => {
    setPendingTeachers((current) => ({ ...current, [groupId]: teacherId }));
  }, []);

  const submitGuideTeacher = useCallback(
    async (groupId: string) => {
      const group = groupsState.groups.find((item) => item.id === groupId);
      if (!group) return;

      const currentTeacherId = group.guideTeacherId ?? '';
      const teacherId = pendingTeachers[groupId] ?? currentTeacherId;
      if (teacherId === currentTeacherId) return;

      setSavingGroupId(groupId);
      try {
        const updated = await assignGuideTeacher(groupId, { guideTeacherId: teacherId || null });
        groupsState.upsertGroup(updated);
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
    [assignGuideTeacher, groupsState, pendingTeachers],
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
    setActiveTab('grupos');
    createGroupMode(undefined);
  }, [activeTab, createGroupMode, createSectionMode, groupSectionFilter, selectedSectionId]);

  const cancelGroupForm = useCallback(() => {
    setGroupFormMode(null);
    setSelectedGroupId(null);
  }, []);

  const isLoading = sectionsState.isLoading || groupsState.isLoading || guideTeachersState.isLoading;
  const loadError = sectionsState.error ?? groupsState.error ?? guideTeachersState.error;

  return {
    activeTab,
    setActiveTab,
    sections: sectionsWithGroups,
    groups: groupsState.groups,
    filteredGroups,
    assignmentGroups,
    groupsForSelectedSection,
    selectedSection,
    selectedSectionId,
    selectedGroup,
    selectedGroupId,
    sectionFormMode,
    groupFormMode,
    expandedSectionIds,
    groupSectionFilter,
    setGroupSectionFilter,
    teacherFilter,
    setTeacherFilter,
    pendingTeachers,
    guideTeachers: guideTeachersState.guideTeachers.length > 0
      ? guideTeachersState.guideTeachers
      : MOCK_GUIDE_TEACHERS,
    guideTeachersError: guideTeachersState.error,
    sectionForm: { values: sectionForm.values, setField: sectionForm.setField, submit: submitSection },
    groupForm: { values: groupForm.values, setField: groupForm.setField, submit: submitGroup },
    selectSection,
    createSectionMode,
    createGroupMode,
    selectGroup,
    toggleSectionExpanded,
    deactivateSelectedSection,
    removeSelectedGroup,
    setPendingTeacher,
    submitGuideTeacher,
    handlePrimaryAction,
    cancelGroupForm,
    cancelSectionForm: createSectionMode,
    getSectionLabel,
    isLoading,
    loadError,
    sectionMutationError,
    groupMutationError,
    isSectionSubmitting,
    isGroupSubmitting,
    savingGroupId,
  };
}

export type SectionsGroupsPanelModel = ReturnType<typeof useSectionsGroupsPanel>;

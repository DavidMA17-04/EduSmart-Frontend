import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AttendanceAvailableOffering,
  AttendanceGroup,
} from '@/entities/attendance';
import { attendanceApi } from '../api/attendanceApi';
import {
  buildCreateAttendanceSessionPayload,
  canSubmitCreateAttendanceSession,
  flowErrorMessage,
  resolveSessionPathAfterCreate,
  shouldApplyOfferingsResponse,
} from './createAttendanceSessionFlow';

export function useCreateAttendanceSessionFlow() {
  const [groups, setGroups] = useState<AttendanceGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [offerings, setOfferings] = useState<AttendanceAvailableOffering[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [offeringsError, setOfferingsError] = useState<string | null>(null);

  const [selectedTeachingAssignmentId, setSelectedTeachingAssignmentId] =
    useState<number | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const offeringsRequestIdRef = useRef(0);
  const selectedGroupIdRef = useRef<number | null>(null);
  selectedGroupIdRef.current = selectedGroupId;

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      setGroups(await attendanceApi.listAttendanceGroups());
    } catch (reason) {
      setGroups([]);
      setGroupsError(
        flowErrorMessage(reason, 'No se pudieron cargar los grupos.'),
      );
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  const loadOfferings = useCallback(async (groupId: number) => {
    const requestId = ++offeringsRequestIdRef.current;
    setOfferingsLoading(true);
    setOfferingsError(null);
    setOfferings([]);

    try {
      const rows = await attendanceApi.getAvailableOfferings(groupId);
      if (
        !shouldApplyOfferingsResponse(requestId, offeringsRequestIdRef.current)
      ) {
        return;
      }
      setOfferings(rows);
    } catch (reason) {
      if (
        !shouldApplyOfferingsResponse(requestId, offeringsRequestIdRef.current)
      ) {
        return;
      }
      setOfferings([]);
      setOfferingsError(
        flowErrorMessage(
          reason,
          'No se pudieron cargar las asignaciones del grupo.',
        ),
      );
    } finally {
      if (
        shouldApplyOfferingsResponse(requestId, offeringsRequestIdRef.current)
      ) {
        setOfferingsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroupId == null) {
      offeringsRequestIdRef.current += 1;
      setOfferings([]);
      setOfferingsLoading(false);
      setOfferingsError(null);
      return;
    }

    void loadOfferings(selectedGroupId);

    return () => {
      offeringsRequestIdRef.current += 1;
    };
  }, [selectedGroupId, loadOfferings]);

  const selectGroup = useCallback((groupId: number | null) => {
    setSelectedGroupId(groupId);
    setSelectedTeachingAssignmentId(null);
    setCreateError(null);
  }, []);

  const selectOffering = useCallback((teachingAssignmentId: number) => {
    setSelectedTeachingAssignmentId(teachingAssignmentId);
    setCreateError(null);
  }, []);

  const retryOfferings = useCallback(() => {
    const groupId = selectedGroupIdRef.current;
    if (groupId == null) return;
    setSelectedTeachingAssignmentId(null);
    setCreateError(null);
    void loadOfferings(groupId);
  }, [loadOfferings]);

  const canStart = canSubmitCreateAttendanceSession({
    groupId: selectedGroupId,
    teachingAssignmentId: selectedTeachingAssignmentId,
    groupsLoading,
    offeringsLoading,
    creating,
  });

  const startClass = useCallback(async (): Promise<
    { ok: true; path: string } | { ok: false; error: string } | null
  > => {
    const payload = buildCreateAttendanceSessionPayload(
      selectedGroupId,
      selectedTeachingAssignmentId,
    );
    if (!payload || creating) return null;

    setCreating(true);
    setCreateError(null);
    try {
      const result = await attendanceApi.createAttendanceSession(payload);
      return { ok: true, path: resolveSessionPathAfterCreate(result) };
    } catch (reason) {
      const error = flowErrorMessage(reason, 'No se pudo iniciar la clase.');
      setCreateError(error);
      return { ok: false, error };
    } finally {
      setCreating(false);
    }
  }, [creating, selectedGroupId, selectedTeachingAssignmentId]);

  return {
    groups,
    groupsLoading,
    groupsError,
    reloadGroups: loadGroups,
    selectedGroupId,
    selectGroup,
    offerings,
    offeringsLoading,
    offeringsError,
    retryOfferings,
    selectedTeachingAssignmentId,
    selectOffering,
    creating,
    createError,
    canStart,
    startClass,
  };
}

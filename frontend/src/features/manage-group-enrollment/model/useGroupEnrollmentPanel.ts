import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdministrativeUser } from '@/entities/user';
import { roleApi } from '@/features/manage-role';
import { userApi } from '@/features/manage-user';
import { sessionHasPermission } from '@/shared/auth';
import { HttpError } from '@/shared/api';
import { groupEnrollmentApi } from '../api/groupEnrollmentApi';
import {
  assessEnrollmentEligibility,
  displayStudentName,
  matchesStudentSearch,
  summarizeEligibility,
  type EligibilityResult,
} from './enrollmentEligibility';
import type { GroupEnrollmentListItem } from './types';

const STUDENT_ROLE_NAME = 'Estudiante';

type Options = {
  groupId: number | null;
  groupLabel?: string;
  onEnrolled?: () => void | Promise<void>;
};

export type StagedStudent = {
  user: AdministrativeUser;
  eligibility: EligibilityResult | null;
};

export function useGroupEnrollmentPanel({
  groupId,
  groupLabel,
  onEnrolled,
}: Options) {
  const canView = sessionHasPermission('students.view');
  const canCreate = sessionHasPermission('students.create');

  const [enrollments, setEnrollments] = useState<GroupEnrollmentListItem[]>(
    [],
  );
  const [catalog, setCatalog] = useState<AdministrativeUser[]>([]);
  const [studentRoleId, setStudentRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startsOn, setStartsOn] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [staged, setStaged] = useState<StagedStudent[]>([]);
  const [verified, setVerified] = useState(false);
  const [searchHits, setSearchHits] = useState<AdministrativeUser[]>([]);

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.userId)),
    [enrollments],
  );

  const reload = useCallback(async () => {
    if (!groupId || !canView) {
      setEnrollments([]);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await groupEnrollmentApi.listByGroup(groupId, 'ACTIVE');
      setEnrollments(rows);
    } catch (error) {
      setEnrollments([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la matrícula.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [canView, groupId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => window.clearTimeout(t);
  }, [search]);

  const loadStudentCatalog = useCallback(async () => {
    if (!canCreate) return;
    try {
      let roleId = studentRoleId;
      if (roleId == null) {
        try {
          const roles = await roleApi.list();
          roleId = roles.find((r) => r.name === STUDENT_ROLE_NAME)?.id ?? null;
          setStudentRoleId(roleId);
        } catch {
          roleId = null;
        }
      }

      const page = await userApi.listPaged({
        status: 'ACTIVE',
        roleId: roleId ?? undefined,
        limit: 200,
        page: 1,
      });
      const items =
        roleId != null
          ? page.items
          : page.items.filter((u) =>
              u.roles.some(
                (r) => r.name === STUDENT_ROLE_NAME && r.status === 'ACTIVE',
              ),
            );
      setCatalog(items);
    } catch {
      setCatalog([]);
    }
  }, [canCreate, studentRoleId]);

  useEffect(() => {
    if (!showModal) return;
    void loadStudentCatalog();
  }, [loadStudentCatalog, showModal]);

  useEffect(() => {
    if (!showModal) return;
    let cancelled = false;
    (async () => {
      if (!debouncedSearch) {
        setSearchHits([]);
        return;
      }
      setIsSearching(true);
      try {
        const page = await userApi.listPaged({
          status: 'ACTIVE',
          roleId: studentRoleId ?? undefined,
          search: debouncedSearch,
          limit: 50,
          page: 1,
        });
        let items = page.items;
        if (studentRoleId == null) {
          items = items.filter((u) =>
            u.roles.some(
              (r) => r.name === STUDENT_ROLE_NAME && r.status === 'ACTIVE',
            ),
          );
        }
        // Extra client filter for apellido2 / etc. if API search is narrow
        items = items.filter((u) => matchesStudentSearch(u, debouncedSearch));
        if (!cancelled) setSearchHits(items);
      } catch {
        const local = catalog.filter((u) =>
          matchesStudentSearch(u, debouncedSearch),
        );
        if (!cancelled) setSearchHits(local);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [catalog, debouncedSearch, showModal, studentRoleId]);

  const openModal = useCallback(() => {
    setShowModal(true);
    setSearch('');
    setDebouncedSearch('');
    setSearchHits([]);
    setStaged([]);
    setVerified(false);
    setModalError(null);
    setStartsOn(new Date().toISOString().slice(0, 10));
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalError(null);
    setStaged([]);
    setVerified(false);
  }, []);

  const stagedIds = useMemo(
    () => new Set(staged.map((s) => s.user.id)),
    [staged],
  );

  const toggleSearchHit = useCallback(
    (user: AdministrativeUser) => {
      setVerified(false);
      setModalError(null);
      setStaged((prev) => {
        if (prev.some((s) => s.user.id === user.id)) {
          return prev.filter((s) => s.user.id !== user.id);
        }
        return [...prev, { user, eligibility: null }];
      });
    },
    [],
  );

  const removeStaged = useCallback((userId: number) => {
    setVerified(false);
    setModalError(null);
    setStaged((prev) => prev.filter((s) => s.user.id !== userId));
  }, []);

  const runVerification = useCallback(() => {
    setModalError(null);
    setStaged((prev) =>
      prev.map((row) => ({
        ...row,
        eligibility: assessEnrollmentEligibility(row.user, enrolledIds),
      })),
    );
    setVerified(true);
  }, [enrolledIds]);

  const eligibilitySummary = useMemo(() => {
    const results = staged
      .map((s) => s.eligibility)
      .filter((e): e is EligibilityResult => e != null);
    if (!verified || results.length !== staged.length) {
      return {
        aptos: 0,
        noAptos: 0,
        total: staged.length,
        percentAptos: 0,
        allAptos: false,
      };
    }
    return summarizeEligibility(results);
  }, [staged, verified]);

  const submitBatch = useCallback(async () => {
    if (!groupId || !canCreate) return false;
    if (!verified || !eligibilitySummary.allAptos) {
      setModalError(
        'Ejecute Verificación y asegúrese de que el 100% de los seleccionados sean aptos.',
      );
      return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) {
      setModalError('Indique una fecha de inicio válida.');
      return false;
    }

    setIsSubmitting(true);
    setModalError(null);
    const failures: string[] = [];
    try {
      for (const row of staged) {
        try {
          await groupEnrollmentApi.create({
            userId: row.user.id,
            groupId,
            startsOn,
          });
        } catch (error) {
          const msg =
            error instanceof HttpError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Error desconocido';
          failures.push(`${displayStudentName(row.user)}: ${msg}`);
        }
      }
      await reload();
      await onEnrolled?.();
      if (failures.length) {
        setModalError(
          `Matrícula parcial. Fallaron ${failures.length}: ${failures.join(' · ')}`,
        );
        setVerified(false);
        return false;
      }
      closeModal();
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canCreate,
    closeModal,
    eligibilitySummary.allAptos,
    groupId,
    onEnrolled,
    reload,
    staged,
    startsOn,
    verified,
  ]);

  const visibleHits = useMemo(() => {
    if (debouncedSearch) return searchHits;
    return catalog
      .filter((u) => !enrolledIds.has(u.id))
      .slice(0, 40);
  }, [catalog, debouncedSearch, enrolledIds, searchHits]);

  return {
    groupId,
    groupLabel,
    canView,
    canCreate,
    enrollments,
    isLoading,
    isSearching,
    isSubmitting,
    loadError,
    modalError,
    showModal,
    search,
    setSearch,
    startsOn,
    setStartsOn,
    staged,
    stagedIds,
    verified,
    eligibilitySummary,
    visibleHits,
    openModal,
    closeModal,
    toggleSearchHit,
    removeStaged,
    runVerification,
    submitBatch,
    reload,
    displayStudentName,
  };
}

export type GroupEnrollmentPanelModel = ReturnType<
  typeof useGroupEnrollmentPanel
>;

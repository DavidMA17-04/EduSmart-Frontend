import { useCallback, useEffect, useRef, useState } from 'react';
import type { AcademicPeriod } from '@/entities/academic-period';
import type { Role } from '@/entities/role';
import type { Specialty } from '@/entities/specialty';
import { academicPeriodApi } from '@/features/manage-academic-period';
import { roleApi } from '@/features/manage-role';
import { sectionApi } from '@/features/manage-section';
import { specialtyApi } from '@/features/manage-specialty';
import { HttpError } from '@/shared/api';
import { administrativeReportsApi } from '../api/administrativeReportsApi';
import type {
  AcademicPeriodReportFilters,
  AcademicPeriodReportRow,
  AcademicStructureReportFilters,
  AcademicStructureReportRow,
  AdministrativeReportType,
  ReportExportFormat,
  UserReportFilters,
  UserReportRow,
} from './types';

export interface UserReportFilterDraft {
  search: string;
  roleId: string;
  status: string;
}

export interface AcademicStructureReportFilterDraft {
  academicPeriodId: string;
  gradeLevel: string;
  specialtyId: string;
  status: string;
}

export interface AcademicPeriodReportFilterDraft {
  status: string;
  startDate: string;
  endDate: string;
}

const EMPTY_USER_DRAFT: UserReportFilterDraft = {
  search: '',
  roleId: '',
  status: '',
};

const EMPTY_STRUCTURE_DRAFT: AcademicStructureReportFilterDraft = {
  academicPeriodId: '',
  gradeLevel: '',
  specialtyId: '',
  status: '',
};

const EMPTY_PERIOD_DRAFT: AcademicPeriodReportFilterDraft = {
  status: '',
  startDate: '',
  endDate: '',
};

function optionalNumber(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function toUserFilters(draft: UserReportFilterDraft): UserReportFilters {
  return {
    search: optionalText(draft.search),
    roleId: optionalNumber(draft.roleId),
    status: optionalText(draft.status),
  };
}

function toStructureFilters(draft: AcademicStructureReportFilterDraft): AcademicStructureReportFilters {
  return {
    academicPeriodId: optionalNumber(draft.academicPeriodId),
    gradeLevel: optionalNumber(draft.gradeLevel),
    specialtyId: optionalNumber(draft.specialtyId),
    status: optionalText(draft.status),
  };
}

function toPeriodFilters(draft: AcademicPeriodReportFilterDraft): AcademicPeriodReportFilters {
  return {
    status: optionalText(draft.status),
    startDate: optionalText(draft.startDate),
    endDate: optionalText(draft.endDate),
  };
}

function loadErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useAdministrativeReports() {
  const [reportType, setReportType] = useState<AdministrativeReportType>('users');

  const [userDraft, setUserDraft] = useState<UserReportFilterDraft>(EMPTY_USER_DRAFT);
  const [structureDraft, setStructureDraft] = useState<AcademicStructureReportFilterDraft>(EMPTY_STRUCTURE_DRAFT);
  const [periodDraft, setPeriodDraft] = useState<AcademicPeriodReportFilterDraft>(EMPTY_PERIOD_DRAFT);

  const [appliedUsers, setAppliedUsers] = useState<UserReportFilters>({});
  const [appliedStructure, setAppliedStructure] = useState<AcademicStructureReportFilters>({});
  const [appliedPeriods, setAppliedPeriods] = useState<AcademicPeriodReportFilters>({});

  const [users, setUsers] = useState<UserReportRow[]>([]);
  const [structureRows, setStructureRows] = useState<AcademicStructureReportRow[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriodReportRow[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<ReportExportFormat | null>(null);
  const exportingRef = useRef(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [gradeLevels, setGradeLevels] = useState<number[]>([]);

  useEffect(() => {
    let active = true;

    void Promise.all([
      roleApi.list().catch(() => [] as Role[]),
      specialtyApi.list().catch(() => [] as Specialty[]),
      academicPeriodApi.list().catch(() => [] as AcademicPeriod[]),
      sectionApi.list().catch(() => [] as { gradeLevel: number }[]),
    ]).then(([nextRoles, nextSpecialties, nextPeriods, sections]) => {
      if (!active) return;
      setRoles(nextRoles);
      setSpecialties(nextSpecialties);
      setAcademicPeriods(nextPeriods);
      const uniqueLevels = [...new Set(sections.map((section) => section.gradeLevel))]
        .filter((level) => Number.isFinite(level))
        .sort((left, right) => left - right);
      setGradeLevels(uniqueLevels);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    setFilterError(null);
    setExportError(null);

    const load = async () => {
      try {
        if (reportType === 'users') {
          const rows = await administrativeReportsApi.getUsers(appliedUsers);
          if (active) setUsers(rows);
          return;
        }

        if (reportType === 'academic-structure') {
          const rows = await administrativeReportsApi.getAcademicStructure(appliedStructure);
          if (active) setStructureRows(rows);
          return;
        }

        const rows = await administrativeReportsApi.getAcademicPeriods(appliedPeriods);
        if (active) setPeriods(rows);
      } catch (reason) {
        if (!active) return;
        const fallback =
          reportType === 'users'
            ? 'No se pudo cargar el reporte de usuarios.'
            : reportType === 'academic-structure'
              ? 'No se pudo cargar el reporte de estructura académica.'
              : 'No se pudo cargar el reporte de períodos académicos.';
        setError(loadErrorMessage(reason, fallback));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [appliedPeriods, appliedStructure, appliedUsers, reportType]);

  const applyFilters = useCallback(() => {
    setExportError(null);
    setFilterError(null);
    if (reportType === 'users') {
      setAppliedUsers(toUserFilters(userDraft));
      return;
    }
    if (reportType === 'academic-structure') {
      setAppliedStructure(toStructureFilters(structureDraft));
      return;
    }
    if (periodDraft.startDate && periodDraft.endDate && periodDraft.startDate > periodDraft.endDate) {
      setFilterError('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    setAppliedPeriods(toPeriodFilters(periodDraft));
  }, [periodDraft, reportType, structureDraft, userDraft]);

  const clearFilters = useCallback(() => {
    setExportError(null);
    setFilterError(null);
    if (reportType === 'users') {
      setUserDraft(EMPTY_USER_DRAFT);
      setAppliedUsers({});
      return;
    }
    if (reportType === 'academic-structure') {
      setStructureDraft(EMPTY_STRUCTURE_DRAFT);
      setAppliedStructure({});
      return;
    }
    setPeriodDraft(EMPTY_PERIOD_DRAFT);
    setAppliedPeriods({});
  }, [reportType]);

  const exportReport = useCallback(async (format: ReportExportFormat) => {
    if (exportingRef.current) return;
    exportingRef.current = true;
    setExportingFormat(format);
    setExportError(null);
    try {
      if (reportType === 'users') {
        await administrativeReportsApi.exportUsers(format, appliedUsers);
        return;
      }
      if (reportType === 'academic-structure') {
        await administrativeReportsApi.exportAcademicStructure(format, appliedStructure);
        return;
      }
      await administrativeReportsApi.exportAcademicPeriods(format, appliedPeriods);
    } catch (reason) {
      setExportError(loadErrorMessage(reason, 'No se pudo descargar el archivo.'));
    } finally {
      exportingRef.current = false;
      setExportingFormat(null);
    }
  }, [appliedPeriods, appliedStructure, appliedUsers, reportType]);

  return {
    reportType,
    setReportType,
    userDraft,
    setUserDraft,
    structureDraft,
    setStructureDraft,
    periodDraft,
    setPeriodDraft,
    users,
    structureRows,
    periods,
    isLoading,
    error,
    filterError,
    exportError,
    exportingFormat,
    roles,
    specialties,
    academicPeriods,
    gradeLevels,
    applyFilters,
    clearFilters,
    exportReport,
  };
}

export interface UserReportRow {
  id: number;
  nationalId: string;
  fullName: string;
  email: string;
  phone: string | null;
  roles: string[];
  status: string;
  createdAt: string;
}

export interface AcademicStructureReportRow {
  groupId: number;
  groupName: string;
  studentCount: number;
  sectionId: number;
  sectionName: string;
  gradeLevel: number;
  specialty: string | null;
  academicPeriod: string;
  guideTeacher: string | null;
  status: string;
}

export interface AcademicPeriodReportRow {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface ReportResponse<T> {
  success: boolean;
  data: T[];
}

export interface UserReportFilters {
  search?: string;
  roleId?: number;
  status?: string;
}

export interface AcademicStructureReportFilters {
  academicPeriodId?: number;
  gradeLevel?: number;
  specialtyId?: number;
  status?: string;
}

export interface AcademicPeriodReportFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export type AdministrativeReportType = 'users' | 'academic-structure' | 'academic-periods';

export type ReportExportFormat = 'pdf' | 'excel';

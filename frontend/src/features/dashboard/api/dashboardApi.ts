import { httpClient } from '@/shared/api/httpClient';

export interface UsersByRole {
  role: string;
  count: number;
}

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalAcademicPeriods: number;
  totalSections: number;
  totalSpecialties: number;
  usersByRole: UsersByRole[];
}

type ApiEnvelope<T> = { success: boolean; data: T };

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await httpClient<ApiEnvelope<DashboardSummary>>('/dashboard/summary');
    return response.data;
  },
};

export type DepartureStatus = 'AUTHORIZED' | 'REJECTED';
export type DepartureType = 'REGULAR' | 'EARLY' | 'EMERGENCY';
export type ScheduledPermitStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED';

export interface StudentSummary {
  id: number;
  fullName: string;
  nationalId: string;
  groupId: number | null;
  groupName: string | null;
  sectionName: string | null;
}

export interface RegisteredGuardian {
  id: number;
  fullName: string;
  nationalIdMasked: string;
  relationship: string | null;
  active: boolean;
}

export interface ScheduledPermit {
  id: string;
  student: StudentSummary;
  authorizedBy: { id: number; fullName: string };
  permitDate: string;
  departureTime: string;
  reason: string;
  status: ScheduledPermitStatus;
  completedAt: string | null;
  createdAt: string;
}

export interface GuardianValidationResult {
  authorized: boolean;
  message: string;
  student: StudentSummary;
  guardian: (RegisteredGuardian & { nationalId: string }) | null;
  relationship: string | null;
  registeredGuardians: RegisteredGuardian[];
  pendingPermit: ScheduledPermit | null;
  lastAuthorizedToday: { id: string; departureTime: string } | null;
  rejectionId: string | null;
}

export interface DepartureHistoryItem {
  id: string;
  departureTime: string;
  status: DepartureStatus;
  departureType: DepartureType;
  justificationReason: string | null;
  relationship: string | null;
  guardianIdentifierMasked: string | null;
  guardianLinked: boolean;
  student: StudentSummary;
  guardian: { id: number; fullName: string } | null;
  securityGuard: { id: number; fullName: string };
  scheduledPermitId: string | null;
}

export interface PaginatedDepartures {
  items: DepartureHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TodayKpis {
  date: string;
  totalDepartures: number;
  earlyDepartures: number;
  emergencyDepartures: number;
  deniedAttempts: number;
  pendingPermits: number;
  generatedAt: string;
}

export interface DepartureHistoryFilters {
  startDate?: string;
  endDate?: string;
  since?: string;
  groupId?: number;
  studentId?: number;
  status?: DepartureStatus;
  departureType?: DepartureType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ValidateGuardianPayload {
  studentIdentifier: string;
  guardianIdentifier: string;
}

export interface RegisterDeparturePayload extends ValidateGuardianPayload {
  decision?: DepartureStatus;
  departureType?: DepartureType;
  justificationReason?: string;
  scheduledPermitId?: string;
}

export interface RegisterDepartureResult {
  id: string;
  status: DepartureStatus;
  scheduledPermitCompleted: boolean;
}

export interface CreatePermitPayload {
  studentIdentifier: string;
  permitDate: string;
  departureTime: string;
  reason: string;
}

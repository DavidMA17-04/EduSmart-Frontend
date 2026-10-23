export type InfractionSeverity =
  | 'VERY_MINOR'
  | 'MINOR'
  | 'SERIOUS'
  | 'VERY_SERIOUS'
  | 'EXTREMELY_SERIOUS';

export type DisciplinaryTrack = 'DIRECT' | 'DUE_PROCESS';

export type InfractionSeverityRule = {
  severity: InfractionSeverity;
  label: string;
  deduction: number;
  track: DisciplinaryTrack;
};

export type InfractionType = {
  id: number;
  name: string;
  description: string | null;
  severity: InfractionSeverity;
  severityLabel: string;
  deduction: number;
  track: DisciplinaryTrack;
  legalReference: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InfractionTypeInput = {
  name: string;
  description?: string;
  severity: InfractionSeverity;
  legalReference?: string;
};

export type DisciplinaryStudentHit = {
  id: number;
  fullName: string;
  nationalId: string;
  groupId: number | null;
  groupName: string | null;
  sectionName: string | null;
  gradeLevel: number | null;
  sectionLabel: string | null;
};

export type CreatedDisciplinaryCase = {
  id: number;
  caseNumber: string;
  status: string;
  track: DisciplinaryTrack;
  severity: InfractionSeverity;
  severityLabel: string;
  deduction: number;
  missingGuideTeacher: boolean;
  isLateReport: boolean;
  groupName: string;
  sectionName: string;
  gradeLevel: number;
  communicationId: number | null;
};

export type DisciplinaryCaseStatus =
  | 'REPORTED'
  | 'INVESTIGATING'
  | 'COMMUNICATED'
  | 'PENDING_RESOLUTION'
  | 'RESOLVED'
  | 'IN_APPEAL'
  | 'FIRM'
  | 'DISMISSED'
  | 'ANNULLED'
  | 'NOTIFIED';

export type DeadlineIndicator = 'ON_TIME' | 'DUE_SOON' | 'OVERDUE' | 'NONE';

export interface DisciplinaryCaseListItem {
  id: number;
  caseNumber: string;
  status: DisciplinaryCaseStatus;
  severity: InfractionSeverity;
  severityLabel: string;
  deduction: number;
  track: DisciplinaryTrack;
  studentUserId: number;
  studentFullName: string;
  sectionLabel: string | null;
  infractionName: string;
  occurredAt: string | null;
  dueOn: string | null;
  deadline: DeadlineIndicator;
  isLateReport: boolean;
  missingGuideTeacher: boolean;
}

export interface DisciplinaryCasePage {
  data: DisciplinaryCaseListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DisciplinaryCaseEvidence {
  id: number;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  context: string;
  createdAt: string | null;
}

export interface DisciplinaryCaseEvent {
  id: number;
  type: string;
  actorUserId: number | null;
  actorName: string | null;
  fromStatus: string | null;
  toStatus: string | null;
  payload: Record<string, unknown> | null;
  visibility: string;
  createdAt: string | null;
}

export interface DisciplinaryFollowUp {
  id: number;
  kind: string;
  followedOn: string;
  description: string;
  participants: string | null;
  reviewOn: string | null;
  outcome: 'PENDING' | 'MET' | 'UNMET';
  outcomeNote: string | null;
  authorUserId: number;
  createdAt: string | null;
}

export interface DisciplinaryCaseDetail extends DisciplinaryCaseListItem {
  description: string;
  place: string;
  witnesses: string | null;
  student: { id: number; fullName: string; nationalId: string };
  sectionName: string | null;
  gradeLevel: number | null;
  reporterUserId: number;
  responsibleUserId: number | null;
  stepStartedOn: string;
  stepBusinessDays: number;
  resolutionOutcome: string | null;
  resolutionReasoning: string | null;
  evidences: DisciplinaryCaseEvidence[];
  events: DisciplinaryCaseEvent[];
  followUps: DisciplinaryFollowUp[];
  readReceipts?: CaseReadReceipt[];
  defenses?: CaseDefense[];
  appeals?: CaseAppeal[];
  precautionaryMeasures?: CasePrecautionaryMeasure[];
  communications?: CaseCommunication[];
  alerts?: CaseAlert[];
}

export interface CaseReadReceipt {
  id: number;
  guardianName: string;
  readAt: string;
  label: string;
}

export interface CaseDefense {
  id: number;
  body: string;
  channel: string;
  presentedByUserId: number;
  presentedAt: string | null;
}

export interface CaseAppeal {
  id: number;
  kind: 'REVOCATION' | 'APPEAL' | string;
  isSubsidiary: boolean;
  body: string;
  filedAt: string | null;
  filedByUserId: number;
  outcome: 'UPHOLD' | 'REVOKE' | 'MODIFY' | null;
  newSeverity: InfractionSeverity | null;
  reasoning: string | null;
  resolverUserId: number | null;
  resolvedAt: string | null;
}

export interface CasePrecautionaryMeasure {
  id: number;
  startsOn: string;
  endsOn: string;
  reason: string;
  paniCoordination: boolean;
  orderedByUserId: number;
  createdAt: string | null;
}

export interface CaseCommunication {
  id: number;
  kind: string;
  issuedAt: string | null;
  deliveryMedium: 'NOTEBOOK' | 'IN_PERSON' | string | null;
  deliveredAt: string | null;
  receivedByName: string | null;
}

export interface CaseAlert {
  code: string;
  notificationId: number;
  issuedOn: string;
  message: string;
}

export interface DisciplinaryCaseFilters {
  status?: DisciplinaryCaseStatus;
  severity?: InfractionSeverity;
  deadline?: Exclude<DeadlineIndicator, 'NONE'>;
  page?: number;
  pageSize?: number;
}

export type DeductionState = 'APPLIED' | 'PROPOSED' | 'NONE';

export type ConductHistoryCase = {
  id: number;
  caseNumber: string;
  status: DisciplinaryCaseStatus;
  severity: InfractionSeverity;
  severityLabel: string;
  infractionName: string;
  occurredAt: string | null;
  deduction: number;
  deductionState: DeductionState;
  deductionLabel: string;
};

export type ConductPeriodHistory = {
  academicPeriodId: number;
  periodName: string;
  appliedDeduction: number;
  conductGrade: number;
  cases: ConductHistoryCase[];
};

export type StudentConductHistory = {
  student: { id: number; fullName: string; nationalId: string };
  periods: ConductPeriodHistory[];
};

export type HistoryStudentOption = {
  id: number;
  fullName: string;
};

export interface NonWorkingDay {
  id: number;
  day: string;
  reason: string;
  authorUserId: number;
}

export interface DisciplinarySettings {
  recidivismThreshold: number;
  conductAlertThreshold: number;
}

export type InfractionTypeFilters = {
  severity?: InfractionSeverity;
  active?: boolean;
};

export type GuardianNotification = {
  id: number;
  communicationId: number;
  caseId: number;
  caseNumber: string;
  kind: string;
  studentUserId: number;
  studentName: string;
  issuedAt: string;
  readAt: string | null;
};

export type GuardianInbox = {
  unreadCount: number;
  items: GuardianNotification[];
};

export type ReadConfirmation = {
  id: number;
  caseId: number;
  readAt: string;
  readIp: string | null;
  readUserAgent: string | null;
  label: string;
};

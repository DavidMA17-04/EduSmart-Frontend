export type GroupEnrollmentStatus = 'ACTIVE' | 'ENDED';

export type GroupEnrollmentStudent = {
  id: number;
  name: string;
  firstLastname: string;
  secondLastname?: string | null;
  nationalId: string;
  email: string;
};

export type GroupEnrollmentListItem = {
  id: number;
  userId: number;
  groupId: number;
  academicPeriodId: number;
  startsOn: string;
  endsOn: string | null;
  status: GroupEnrollmentStatus;
  user: GroupEnrollmentStudent;
};

export type CreateGroupEnrollmentPayload = {
  userId: number;
  groupId: number;
  startsOn: string;
  endsOn?: string | null;
  academicPeriodId?: number;
};

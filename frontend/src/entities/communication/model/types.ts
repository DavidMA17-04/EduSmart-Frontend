export type CommunicationPriority = 'URGENT' | 'IMPORTANT' | 'NORMAL';
export type CommunicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type RecipientType = 'ALL' | 'ROLE' | 'GROUP' | 'USER';

export interface CommunicationRecipient {
  recipientType: RecipientType;
  targetId?: string | null;
  /** Texto legible que envía el backend ("Estudiantes", "10-1 · 10° Año"…). */
  label?: string;
}

export interface Communication {
  id: string;
  title: string;
  content: string;
  priority: CommunicationPriority;
  status: CommunicationStatus;
  requiresAcknowledgment: boolean;
  publishDate: string | null;
  expirationDate: string | null;
  authorId: number;
  authorName?: string;
  authorEmail?: string;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
  readAt?: string | null;
  isAcknowledged?: boolean;
  acknowledgedAt?: string | null;
  recipients?: CommunicationRecipient[];
  totalReads?: number;
  totalAcknowledged?: number;
  totalEstimatedAudience?: number;
  readRate?: number;
}

export interface CommunicationReader {
  userId: number;
  fullName: string;
  email: string;
  readAt: string;
  acknowledgedAt: string | null;
}

export interface CommunicationStats {
  communicationId: string;
  title: string;
  priority: CommunicationPriority;
  status: CommunicationStatus;
  requiresAcknowledgment: boolean;
  totalAudience: number;
  totalReads: number;
  totalAcknowledged: number;
  readRate: number;
  ackRate: number;
  readers: CommunicationReader[];
}

export interface CreateCommunicationPayload {
  title: string;
  content: string;
  priority?: CommunicationPriority;
  status?: CommunicationStatus;
  requiresAcknowledgment?: boolean;
  publishDate?: string | null;
  expirationDate?: string | null;
  recipients?: CommunicationRecipient[];
}

export interface UpdateCommunicationPayload {
  title?: string;
  content?: string;
  priority?: CommunicationPriority;
  status?: CommunicationStatus;
  requiresAcknowledgment?: boolean;
  publishDate?: string | null;
  expirationDate?: string | null;
  recipients?: CommunicationRecipient[];
}

export interface CommunicationFilter {
  status?: CommunicationStatus;
  priority?: CommunicationPriority;
  search?: string;
  unreadOnly?: boolean;
  urgentOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface TargetOptionRole {
  value: string;
  label: string;
}

export interface TargetOptionGroup {
  id: string;
  name: string;
}

export interface TargetOptions {
  roles: TargetOptionRole[];
  groups: TargetOptionGroup[];
}

export interface CommunicationFeedResponse {
  items: Communication[];
  total: number;
  /** No leídos del usuario, independiente del filtro activo. */
  unreadCount: number;
}

export interface CommunicationAdminResponse {
  items: Communication[];
  total: number;
  countsByStatus: Record<CommunicationStatus, number>;
}

export interface AudienceEstimate {
  total: number;
}

import type { CommunicationPriority, CommunicationStatus } from '@/types/communications';

export type CommunicationsDashboard = {
  countsByStatus: Record<CommunicationStatus, number>;
  publishedRequiringAck: number;
  avgAckRate: number;
  avgReadRate: number;
  pendingAckTotal: number;
  pendingAckItems: Array<{
    id: string;
    title: string;
    priority: CommunicationPriority;
    totalEstimatedAudience: number;
    totalAcknowledged: number;
    pendingCount: number;
    ackRate: number;
    publishDate: string | null;
  }>;
};

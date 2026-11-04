import { httpClient } from '@/shared/api/httpClient';
import {
  AudienceEstimate,
  Communication,
  CommunicationAdminResponse,
  CommunicationFeedResponse,
  CommunicationFilter,
  CommunicationRecipient,
  CommunicationStats,
  CreateCommunicationPayload,
  TargetOptions,
  UpdateCommunicationPayload,
} from '@/types/communications';

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

/** El backend envuelve toda respuesta en `{ success, message, data }`. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const payload = await httpClient<ApiEnvelope<T> | T>(path, init);
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

function buildQueryString(params?: CommunicationFilter): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    // Los booleanos en false se omiten: el backend los trata como "sin filtro".
    if (val === undefined || val === null || val === '' || val === false) continue;
    searchParams.set(key, String(val));
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

export const communicationApi = {
  getFeed: (filter?: CommunicationFilter): Promise<CommunicationFeedResponse> =>
    request<CommunicationFeedResponse>(`/communications/feed${buildQueryString(filter)}`),

  getAdminList: (filter?: CommunicationFilter): Promise<CommunicationAdminResponse> =>
    request<CommunicationAdminResponse>(`/communications/admin${buildQueryString(filter)}`),

  getTargetOptions: (): Promise<TargetOptions> =>
    request<TargetOptions>('/communications/target-options'),

  estimateAudience: (recipients: CommunicationRecipient[]): Promise<AudienceEstimate> =>
    request<AudienceEstimate>('/communications/audience-estimate', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients.map(({ recipientType, targetId }) => ({
          recipientType,
          ...(targetId ? { targetId } : {}),
        })),
      }),
    }),

  /** Obtiene el detalle y, si está publicado, registra la lectura. */
  getById: (id: string): Promise<Communication> => request<Communication>(`/communications/${id}`),

  create: (payload: CreateCommunicationPayload): Promise<Communication> =>
    request<Communication>('/communications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateCommunicationPayload): Promise<Communication> =>
    request<Communication>(`/communications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  publish: (id: string): Promise<Communication> =>
    request<Communication>(`/communications/${id}/publish`, { method: 'POST' }),

  archive: (id: string): Promise<Communication> =>
    request<Communication>(`/communications/${id}/archive`, { method: 'POST' }),

  remove: (id: string): Promise<{ success: boolean }> =>
    request<{ success: boolean }>(`/communications/${id}`, { method: 'DELETE' }),

  markAsRead: (id: string): Promise<{ readAt: string }> =>
    request<{ readAt: string }>(`/communications/${id}/read`, { method: 'POST' }),

  confirmAcknowledgment: (id: string): Promise<{ acknowledgedAt: string }> =>
    request<{ acknowledgedAt: string }>(`/communications/${id}/acknowledge`, { method: 'POST' }),

  getStats: (id: string): Promise<CommunicationStats> =>
    request<CommunicationStats>(`/communications/${id}/stats`),
};

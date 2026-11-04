import type {
  CreateSpecialtyPayload,
  Specialty,
  SpecialtyHubCover,
  SpecialtyKind,
  UpdateSpecialtyPayload,
} from '@/entities/specialty';
import { httpClient } from '@/shared/api';

type ApiEnvelope<T> = { success: boolean; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await httpClient<ApiEnvelope<T>>(path, init);
  return response.data;
}

export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.startsWith('/') ? path : `/${path}`;
  const apiBase = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

  // Absolute API host → same origin as API (uploads live on the backend).
  if (/^https?:\/\//i.test(apiBase)) {
    const origin = apiBase.replace(/\/api\/v1$/i, '');
    return `${origin}${normalized}`;
  }

  // Relative API (Vite proxy) → keep same-origin path so /uploads is proxied.
  return normalized;
}

export const specialtyApi = {
  list: (kind?: SpecialtyKind) => {
    const query = kind ? `?kind=${encodeURIComponent(kind)}` : '';
    return request<Specialty[]>(`/specialties${query}`);
  },
  getById: (id: number) => request<Specialty>(`/specialties/${id}`),
  create: (payload: CreateSpecialtyPayload) =>
    request<Specialty>('/specialties', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: UpdateSpecialtyPayload) =>
    request<Specialty>(`/specialties/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivate: (id: number) => request<Specialty>(`/specialties/${id}`, { method: 'DELETE' }),
  listHubCovers: () => request<SpecialtyHubCover[]>('/specialties/hub-covers'),
  uploadHubCover: async (kind: SpecialtyKind, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<SpecialtyHubCover>(`/specialties/hub-covers/${kind}`, {
      method: 'POST',
      body: formData,
    });
  },
  clearHubCover: (kind: SpecialtyKind) =>
    request<SpecialtyHubCover>(`/specialties/hub-covers/${kind}`, { method: 'DELETE' }),
};

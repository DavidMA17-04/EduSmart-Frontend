import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { communicationApi } from '@/services/communicationApi';
import {
  Communication,
  CommunicationAdminResponse,
  CommunicationFeedResponse,
  CommunicationFilter,
  CommunicationRecipient,
  CommunicationStatus,
  CreateCommunicationPayload,
  UpdateCommunicationPayload,
} from '@/types/communications';
import { useDebouncedValue } from './useDebouncedValue';

/** Claves centralizadas para invalidar cachés de forma consistente. */
export const communicationKeys = {
  all: ['communications'] as const,
  feed: (filter?: CommunicationFilter) => ['communications', 'feed', filter ?? {}] as const,
  feedRoot: ['communications', 'feed'] as const,
  admin: (filter?: CommunicationFilter) => ['communications', 'admin', filter ?? {}] as const,
  adminRoot: ['communications', 'admin'] as const,
  detail: (id: string | null) => ['communications', 'detail', id] as const,
  stats: (id: string | null) => ['communications', 'stats', id] as const,
  targetOptions: ['communications', 'target-options'] as const,
  audience: (recipients: CommunicationRecipient[]) =>
    ['communications', 'audience', recipients] as const,
};

const FEED_REFRESH_MS = 60_000;

export function useCommunicationsFeed(filter?: CommunicationFilter) {
  return useQuery({
    queryKey: communicationKeys.feed(filter),
    queryFn: () => communicationApi.getFeed(filter),
    placeholderData: keepPreviousData,
    refetchInterval: FEED_REFRESH_MS,
    refetchOnWindowFocus: true,
  });
}

export function useAdminCommunications(filter?: CommunicationFilter) {
  return useQuery({
    queryKey: communicationKeys.admin(filter),
    queryFn: () => communicationApi.getAdminList(filter),
    placeholderData: keepPreviousData,
  });
}

/**
 * Detalle de un comunicado. Al consultarlo el backend registra la lectura,
 * así que se usa al abrir el modal de lectura.
 */
export function useCommunicationDetail(id: string | null) {
  return useQuery({
    queryKey: communicationKeys.detail(id),
    queryFn: () => communicationApi.getById(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCommunicationStats(id: string | null) {
  return useQuery({
    queryKey: communicationKeys.stats(id),
    queryFn: () => communicationApi.getStats(id as string),
    enabled: Boolean(id),
  });
}

export function useTargetOptions(enabled = true) {
  return useQuery({
    queryKey: communicationKeys.targetOptions,
    queryFn: () => communicationApi.getTargetOptions(),
    staleTime: 5 * 60_000,
    enabled,
  });
}

/** Estimación en vivo de cuántos usuarios alcanza la segmentación. */
export function useAudienceEstimate(recipients: CommunicationRecipient[], enabled = true) {
  // Se debouncea la versión serializada para no depender de la identidad del arreglo.
  const serialized = JSON.stringify(
    recipients.map(({ recipientType, targetId }) => ({ recipientType, targetId: targetId ?? null })),
  );
  const debouncedKey = useDebouncedValue(serialized, 350);
  const debounced = useMemo(
    () => JSON.parse(debouncedKey) as CommunicationRecipient[],
    [debouncedKey],
  );
  const hasTargets =
    debounced.length > 0 &&
    debounced.every((r) => r.recipientType === 'ALL' || Boolean(r.targetId));

  return useQuery({
    queryKey: communicationKeys.audience(debounced),
    queryFn: () => communicationApi.estimateAudience(debounced),
    enabled: enabled && hasTargets,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

type FeedPatch = Partial<Pick<Communication, 'isRead' | 'readAt' | 'isAcknowledged' | 'acknowledgedAt'>>;

/** Aplica un cambio optimista a todas las páginas/filtros del feed. */
function patchFeedItem(queryClient: QueryClient, id: string, patch: FeedPatch) {
  queryClient.setQueriesData<CommunicationFeedResponse>(
    { queryKey: communicationKeys.feedRoot },
    (old) => {
      if (!old) return old;
      let becameRead = false;
      const items = old.items.map((item) => {
        if (item.id !== id) return item;
        if (!item.isRead && patch.isRead) becameRead = true;
        return { ...item, ...patch };
      });
      return {
        ...old,
        items,
        unreadCount: becameRead ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
      };
    },
  );
  queryClient.setQueryData<Communication>(communicationKeys.detail(id), (old) =>
    old ? { ...old, ...patch } : old,
  );
}

function patchAdminStatus(queryClient: QueryClient, id: string, status: CommunicationStatus | null) {
  queryClient.setQueriesData<CommunicationAdminResponse>(
    { queryKey: communicationKeys.adminRoot },
    (old) => {
      if (!old) return old;
      const items =
        status === null
          ? old.items.filter((item) => item.id !== id)
          : old.items.map((item) => (item.id === id ? { ...item, status } : item));
      return { ...old, items };
    },
  );
}

export function useCommunicationMutations() {
  const queryClient = useQueryClient();
  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: communicationKeys.all });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCommunicationPayload) => communicationApi.create(payload),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCommunicationPayload }) =>
      communicationApi.update(id, payload),
    onSuccess: invalidateAll,
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => communicationApi.publish(id),
    onMutate: (id: string) => patchAdminStatus(queryClient, id, 'PUBLISHED'),
    onSettled: invalidateAll,
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => communicationApi.archive(id),
    onMutate: (id: string) => patchAdminStatus(queryClient, id, 'ARCHIVED'),
    onSettled: invalidateAll,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => communicationApi.remove(id),
    onMutate: (id: string) => patchAdminStatus(queryClient, id, null),
    onSettled: invalidateAll,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => communicationApi.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: communicationKeys.feedRoot });
      patchFeedItem(queryClient, id, { isRead: true, readAt: new Date().toISOString() });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: communicationKeys.feedRoot }),
  });

  const confirmAcknowledgmentMutation = useMutation({
    mutationFn: (id: string) => communicationApi.confirmAcknowledgment(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: communicationKeys.feedRoot });
      const now = new Date().toISOString();
      patchFeedItem(queryClient, id, {
        isRead: true,
        isAcknowledged: true,
        acknowledgedAt: now,
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.feedRoot });
      queryClient.invalidateQueries({ queryKey: communicationKeys.detail(id) });
    },
  });

  return {
    createMutation,
    updateMutation,
    publishMutation,
    archiveMutation,
    removeMutation,
    markAsReadMutation,
    confirmAcknowledgmentMutation,
  };
}

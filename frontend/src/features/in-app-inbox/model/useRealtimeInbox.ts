import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { clearAccessToken, getAccessToken } from '@/shared/auth';

type RealtimeEvent = {
  type: string;
  at?: string;
  unreadCount?: number;
  sessionId?: number;
  message?: string;
};

function realtimeUrl(): string {
  const api = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');
  if (api.startsWith('http://') || api.startsWith('https://')) {
    return api.replace(/\/api\/v1$/, '');
  }
  return window.location.origin;
}

/**
 * Mantiene un canal Socket.IO autenticado y refresca la bandeja ante eventos.
 * Si llega session.revoked, limpia el token y recarga a login.
 */
export function useRealtimeInbox(onInboxChanged: () => void | Promise<unknown>) {
  const onChangeRef = useRef(onInboxChanged);
  onChangeRef.current = onInboxChanged;

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return undefined;

    let socket: Socket | null = null;
    let disposed = false;

    try {
      socket = io(`${realtimeUrl()}/realtime`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1500,
        reconnectionAttempts: 20,
      });
    } catch {
      return undefined;
    }

    const handleEvent = (event: RealtimeEvent) => {
      if (!event?.type) return;
      if (event.type === 'session.revoked') {
        clearAccessToken();
        window.location.assign('/login');
        return;
      }
      if (
        event.type === 'inbox.changed' ||
        event.type === 'inbox.item' ||
        event.type.startsWith('alert.')
      ) {
        void onChangeRef.current();
      }
    };

    socket.on('event', handleEvent);
    socket.on('connect', () => {
      if (disposed) return;
      void onChangeRef.current();
    });

    return () => {
      disposed = true;
      socket?.off('event', handleEvent);
      socket?.disconnect();
    };
  }, []);
}

import { useEffect, useState, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'offline_demo';

export interface RoomBroadcastMessage {
  event: string;
  payload: any;
  senderId?: string;
  timestamp: string;
}

export function useRoomChannel(roomCode: string, isHost = false) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<RoomBroadcastMessage[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const clientIdRef = useRef<string>(
    isHost ? 'host' : `remote-${Math.random().toString(36).substring(2, 8)}`
  );

  useEffect(() => {
    if (!roomCode) {
      setStatus('disconnected');
      return;
    }

    if (!isSupabaseConfigured) {
      // In offline/demo mode, simulate successful connection
      setStatus('offline_demo');
      setOnlineCount(1);
      return;
    }

    setStatus('connecting');
    const normalizedRoom = roomCode.toUpperCase().trim();

    // 1. Initialize channel
    const channel = supabase.channel(`room:${normalizedRoom}`, {
      config: {
        broadcast: { self: false }, // Avoid receiving own broadcasts
        presence: { key: clientIdRef.current },
      },
    });

    // 2. Set up Presence listeners (tracks connected guest phones)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      // Count all connected users excluding the TV host
      const remotes = Object.values(state)
        .flat()
        .filter((presence: any) => presence.key !== 'host');
      setOnlineCount(remotes.length);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log(`🟢 [Room ${normalizedRoom}] User joined:`, key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log(`🔴 [Room ${normalizedRoom}] User left:`, key, leftPresences);
    });

    // 3. Set up Broadcast listener
    channel.on('broadcast', { event: '*' }, (eventPayload) => {
      const message: RoomBroadcastMessage = {
        event: eventPayload.event,
        payload: eventPayload.payload,
        timestamp: new Date().toLocaleTimeString(),
      };
      setRecentEvents((prev) => [message, ...prev.slice(0, 19)]); // Keep last 20 events
    });

    // 4. Subscribe to the channel
    channel.subscribe(async (subscribeStatus) => {
      if (subscribeStatus === 'SUBSCRIBED') {
        setStatus('connected');
        // Track presence after joining
        await channel.track({
          role: isHost ? 'host' : 'remote',
          joinedAt: new Date().toISOString(),
        });
      } else if (subscribeStatus === 'CHANNEL_ERROR' || subscribeStatus === 'TIMED_OUT') {
        setStatus('disconnected');
      }
    });

    channelRef.current = channel;

    // 5. Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomCode, isHost]);

  // Dispatch a broadcast event to all other clients in the room
  const sendBroadcast = useCallback(
    async (event: string, payload: any) => {
      if (status === 'offline_demo') {
        // In demo mode, simulate event locally
        const message: RoomBroadcastMessage = {
          event,
          payload,
          timestamp: new Date().toLocaleTimeString(),
        };
        setRecentEvents((prev) => [message, ...prev.slice(0, 19)]);
        return;
      }

      if (!channelRef.current) {
        console.warn('Cannot send broadcast: Channel is not initialized.');
        return;
      }

      await channelRef.current.send({
        type: 'broadcast',
        event,
        payload,
      });
    },
    [status]
  );

  return {
    status,
    onlineCount,
    recentEvents,
    sendBroadcast,
    clientId: clientIdRef.current,
  };
}

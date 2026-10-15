import { useEffect, useState, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isRedisConfigured } from '../lib/redis';
import {
  publishRedisEvent,
  fetchRedisEvents,
  heartbeatRedisPresence,
  removeRedisPresence,
  getRedisOnlineCount,
} from '../lib/redis-room';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'offline_demo';
export type TransportType = 'redis' | 'supabase' | 'local';

export interface RoomBroadcastMessage {
  event: string;
  payload: any;
  senderId?: string;
  timestamp: string;
}

export function useRoomChannel(
  roomCode: string,
  isHost = false,
  onBroadcast?: (event: string, payload: any) => void
) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<RoomBroadcastMessage[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const processedMsgIdsRef = useRef<Set<string>>(new Set());

  const onBroadcastRef = useRef(onBroadcast);
  onBroadcastRef.current = onBroadcast;

  const clientIdRef = useRef<string>(
    isHost
      ? `screen-${Math.random().toString(36).substring(2, 8)}`
      : `remote-${Math.random().toString(36).substring(2, 8)}`
  );

  const transport: TransportType = isRedisConfigured
    ? 'redis'
    : isSupabaseConfigured
      ? 'supabase'
      : 'local';

  useEffect(() => {
    if (!roomCode) {
      setStatus('disconnected');
      return;
    }

    const normalizedRoom = roomCode.toUpperCase().trim();
    setStatus('connecting');

    // 1. Setup local BroadcastChannel for 0ms cross-tab & offline room sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel(`karaoke_room_${normalizedRoom}`);
        bcRef.current = bc;

        bc.onmessage = (ev) => {
          const { event, payload, senderId, msgId } = ev.data || {};
          if (!event || senderId === clientIdRef.current) return;

          // Prevent duplicate execution if also received via Redis / Supabase
          if (msgId && processedMsgIdsRef.current.has(msgId)) return;
          if (msgId) {
            processedMsgIdsRef.current.add(msgId);
            if (processedMsgIdsRef.current.size > 200) {
              processedMsgIdsRef.current.clear();
            }
          }

          if (event === 'presence:ping' && isHost) {
            bc?.postMessage({ event: 'presence:pong', senderId: clientIdRef.current });
            setOnlineCount((c) => Math.max(1, c + 1));
            return;
          }
          if (event === 'presence:pong' && !isHost) {
            setStatus('connected');
            setOnlineCount(1);
            return;
          }

          const message: RoomBroadcastMessage = {
            event,
            payload,
            senderId,
            timestamp: new Date().toLocaleTimeString(),
          };
          setRecentEvents((prev) => [message, ...prev.slice(0, 19)]);
          if (onBroadcastRef.current) {
            onBroadcastRef.current(event, payload);
          }
        };

        if (!isHost) {
          bc.postMessage({ event: 'presence:ping', senderId: clientIdRef.current });
        }
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // 2. Storage event listener to keep queue items in sync across local tabs
    const handleLocalQueueChange = () => {
      if (onBroadcastRef.current) {
        onBroadcastRef.current('queue:updated', {});
      }
    };
    window.addEventListener('videoke_queue_change', handleLocalQueueChange);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes(normalizedRoom)) {
        handleLocalQueueChange();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Fallback timer: If cloud takes longer than 2.0s, mark connected in local mode
    const fallbackTimer = setTimeout(() => {
      setStatus('connected');
      if (isHost) setOnlineCount((c) => Math.max(1, c));
      else setOnlineCount(1);
    }, 2000);

    // 4. Redis Real-Time Setup (Pub/Sub stream and presence heartbeats)
    let redisPollInterval: any = null;
    let redisPresenceInterval: any = null;

    if (isRedisConfigured) {
      clearTimeout(fallbackTimer);
      setStatus('connected');

      // Heartbeat presence immediately
      heartbeatRedisPresence(normalizedRoom, {
        clientId: clientIdRef.current,
        role: isHost ? 'host' : 'remote',
      });
      getRedisOnlineCount(normalizedRoom).then((count) => {
        setOnlineCount(Math.max(1, count));
      });

      // Periodic presence heartbeat (every 5 seconds)
      redisPresenceInterval = setInterval(async () => {
        await heartbeatRedisPresence(normalizedRoom, {
          clientId: clientIdRef.current,
          role: isHost ? 'host' : 'remote',
        });
        const count = await getRedisOnlineCount(normalizedRoom);
        setOnlineCount(Math.max(1, count));
      }, 5000);

      // Low-latency polling of Redis event stream (every 650ms)
      redisPollInterval = setInterval(async () => {
        const events = await fetchRedisEvents(normalizedRoom, 10);
        if (!events || events.length === 0) return;

        // Process from oldest to newest so sequential commands execute accurately
        const chronological = [...events].reverse();
        for (const msg of chronological) {
          if (!msg.id || !msg.event) continue;
          if (msg.senderId === clientIdRef.current) continue;
          if (processedMsgIdsRef.current.has(msg.id)) continue;

          processedMsgIdsRef.current.add(msg.id);
          if (processedMsgIdsRef.current.size > 200) {
            processedMsgIdsRef.current.clear();
          }

          const message: RoomBroadcastMessage = {
            event: msg.event,
            payload: msg.payload,
            senderId: msg.senderId,
            timestamp: msg.timestamp || new Date().toLocaleTimeString(),
          };
          setRecentEvents((prev) => [message, ...prev.slice(0, 19)]);
          if (onBroadcastRef.current) {
            onBroadcastRef.current(msg.event, msg.payload);
          }
        }
      }, 650);
    }

    // 5. Initialize Supabase channel if configured
    if (isSupabaseConfigured) {
      try {
        const channel = supabase.channel(`room:${normalizedRoom}`, {
          config: {
            broadcast: { self: false },
            presence: { key: clientIdRef.current },
          },
        });

        channel.on('presence', { event: 'sync' }, () => {
          if (!isRedisConfigured) {
            const state = channel.presenceState();
            const total = Object.values(state).flat().length;
            setOnlineCount(Math.max(1, total));
          }
        });

        channel.on('broadcast', { event: '*' }, (eventPayload) => {
          const msgId = eventPayload.payload?.msgId;
          if (msgId && processedMsgIdsRef.current.has(msgId)) return;
          if (msgId) {
            processedMsgIdsRef.current.add(msgId);
            if (processedMsgIdsRef.current.size > 200) {
              processedMsgIdsRef.current.clear();
            }
          }

          const message: RoomBroadcastMessage = {
            event: eventPayload.event,
            payload: eventPayload.payload,
            timestamp: new Date().toLocaleTimeString(),
          };
          setRecentEvents((prev) => [message, ...prev.slice(0, 19)]);
          if (onBroadcastRef.current) {
            onBroadcastRef.current(eventPayload.event, eventPayload.payload);
          }
        });

        channel.subscribe(async (subscribeStatus) => {
          clearTimeout(fallbackTimer);
          if (subscribeStatus === 'SUBSCRIBED') {
            setStatus('connected');
            try {
              await channel.track({
                role: isHost ? 'host' : 'remote',
                joinedAt: new Date().toISOString(),
              });
            } catch {}
          } else if (subscribeStatus === 'CHANNEL_ERROR' || subscribeStatus === 'TIMED_OUT') {
            setStatus('connected');
          }
        });

        channelRef.current = channel;
      } catch {
        setStatus('connected');
      }
    } else if (!isRedisConfigured) {
      // If neither Redis nor Supabase is configured, resolve to offline mode
      clearTimeout(fallbackTimer);
      setStatus('offline_demo');
      setOnlineCount(1);
    }

    // 6. Cleanup on unmount
    return () => {
      clearTimeout(fallbackTimer);
      if (redisPollInterval) clearInterval(redisPollInterval);
      if (redisPresenceInterval) clearInterval(redisPresenceInterval);
      if (isRedisConfigured) {
        removeRedisPresence(normalizedRoom, clientIdRef.current).catch(() => {});
      }
      window.removeEventListener('videoke_queue_change', handleLocalQueueChange);
      window.removeEventListener('storage', handleStorageChange);
      if (bcRef.current) {
        bcRef.current.close();
        bcRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomCode, isHost]);

  // Dispatch a broadcast event to all other clients in the room across active transports
  const sendBroadcast = useCallback(
    async (event: string, payload: any) => {
      const msgId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      processedMsgIdsRef.current.add(msgId);

      const message: RoomBroadcastMessage = {
        event,
        payload,
        senderId: clientIdRef.current,
        timestamp: new Date().toLocaleTimeString(),
      };
      setRecentEvents((prev) => [message, ...prev.slice(0, 19)]);

      const normalizedRoom = roomCode.toUpperCase().trim();

      // 1. Post to local BroadcastChannel (instant 0ms cross-tab communication)
      if (bcRef.current) {
        try {
          bcRef.current.postMessage({
            event,
            payload,
            senderId: clientIdRef.current,
            msgId,
          });
        } catch (err) {
          console.warn('Error posting to BroadcastChannel:', err);
        }
      }

      // 2. Publish to Redis if configured
      if (isRedisConfigured && normalizedRoom) {
        publishRedisEvent(normalizedRoom, {
          id: msgId,
          event,
          payload,
          senderId: clientIdRef.current,
          timestamp: message.timestamp,
        }).catch((err) => {
          console.warn('Redis broadcast error:', err);
        });
      }

      // 3. Post to Supabase Realtime channel if subscribed
      if (channelRef.current) {
        try {
          await channelRef.current.send({
            type: 'broadcast',
            event,
            payload: { ...payload, msgId, senderId: clientIdRef.current },
          });
        } catch {
          // Silently fallback to local broadcast
        }
      }
    },
    [roomCode]
  );

  return {
    status,
    onlineCount,
    recentEvents,
    sendBroadcast,
    clientId: clientIdRef.current,
    transport,
  };
}

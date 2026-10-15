import { getRedisClient } from './redis';
import type { QueueItem } from '../types/song';

export interface RedisBroadcastMessage {
  id: string;
  event: string;
  payload: any;
  senderId: string;
  timestamp: string;
}

export interface RedisRoomState {
  nowPlaying?: {
    songId: number;
    title: string;
    artist: string;
    singerName: string;
    youtubeId: string;
    startedAt: number;
    duration: number;
  } | null;
  isPlaying: boolean;
  keyOffset: number;
  updatedAt: number;
}

export interface RedisPresenceInfo {
  clientId: string;
  role: 'host' | 'remote';
  name?: string;
  lastSeen: number;
}

const ROOM_TTL_SECONDS = 86400; // 24 hours

export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * Publish a real-time event to the room's Redis event stream
 */
export async function publishRedisEvent(
  roomCode: string,
  message: RedisBroadcastMessage
): Promise<boolean> {
  const client = getRedisClient();
  if (!client || !roomCode) return false;

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:events`;

  try {
    const raw = typeof message === 'string' ? message : JSON.stringify(message);
    await client.lpush(key, raw);
    await client.ltrim(key, 0, 49); // Keep latest 50 events
    await client.expire(key, ROOM_TTL_SECONDS);
    return true;
  } catch (err) {
    console.warn('[Redis] Failed to publish event:', err);
    return false;
  }
}

/**
 * Fetch the latest events from the room's Redis event stream
 */
export async function fetchRedisEvents(
  roomCode: string,
  limit = 20
): Promise<RedisBroadcastMessage[]> {
  const client = getRedisClient();
  if (!client || !roomCode) return [];

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:events`;

  try {
    const rawList: any[] = await client.lrange(key, 0, limit - 1);
    if (!Array.isArray(rawList)) return [];

    const messages: RedisBroadcastMessage[] = [];
    for (const item of rawList) {
      try {
        const parsed = typeof item === 'string' ? JSON.parse(item) : item;
        if (parsed && parsed.id && parsed.event) {
          messages.push(parsed);
        }
      } catch {}
    }
    return messages;
  } catch (err) {
    console.warn('[Redis] Failed to fetch events:', err);
    return [];
  }
}

/**
 * Save or update the room's current playback state
 */
export async function setRedisRoomState(roomCode: string, state: RedisRoomState): Promise<boolean> {
  const client = getRedisClient();
  if (!client || !roomCode) return false;

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:state`;

  try {
    await client.set(key, JSON.stringify(state), { ex: ROOM_TTL_SECONDS });
    return true;
  } catch (err) {
    console.warn('[Redis] Failed to set room state:', err);
    return false;
  }
}

/**
 * Retrieve the active playback state of a room
 */
export async function getRedisRoomState(roomCode: string): Promise<RedisRoomState | null> {
  const client = getRedisClient();
  if (!client || !roomCode) return null;

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:state`;

  try {
    const raw = await client.get(key);
    if (!raw) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as RedisRoomState);
  } catch (err) {
    console.warn('[Redis] Failed to get room state:', err);
    return null;
  }
}

/**
 * Heartbeat client presence into Redis
 */
export async function heartbeatRedisPresence(
  roomCode: string,
  info: { clientId: string; role: 'host' | 'remote'; name?: string }
): Promise<void> {
  const client = getRedisClient();
  if (!client || !roomCode) return;

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:presence`;

  try {
    const record: RedisPresenceInfo = {
      clientId: info.clientId,
      role: info.role,
      name: info.name,
      lastSeen: Date.now(),
    };
    await client.hset(key, { [info.clientId]: JSON.stringify(record) });
    await client.expire(key, ROOM_TTL_SECONDS);
  } catch (err) {
    console.warn('[Redis] Presence heartbeat failed:', err);
  }
}

/**
 * Remove client from Redis presence when gracefully unmounting
 */
export async function removeRedisPresence(roomCode: string, clientId: string): Promise<void> {
  const client = getRedisClient();
  if (!client || !roomCode || !clientId) return;

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:presence`;

  try {
    await client.hdel(key, clientId);
  } catch {}
}

/**
 * Count active online clients in a room (within last 15 seconds)
 */
export async function getRedisOnlineCount(
  roomCode: string,
  maxInactiveMs = 15000
): Promise<number> {
  const client = getRedisClient();
  if (!client || !roomCode) return 0;

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:presence`;

  try {
    const rawAll: Record<string, any> | null = await client.hgetall(key);
    if (!rawAll) return 0;

    const now = Date.now();
    let count = 0;
    const staleIds: string[] = [];

    for (const [id, value] of Object.entries(rawAll)) {
      try {
        const info: RedisPresenceInfo = typeof value === 'string' ? JSON.parse(value) : value;
        if (now - info.lastSeen <= maxInactiveMs) {
          count++;
        } else if (now - info.lastSeen > maxInactiveMs * 4) {
          staleIds.push(id);
        }
      } catch {
        staleIds.push(id);
      }
    }

    // Clean up very stale participants in background
    if (staleIds.length > 0) {
      client.hdel(key, ...staleIds).catch(() => {});
    }

    return count;
  } catch (err) {
    console.warn('[Redis] Failed to get presence count:', err);
    return 0;
  }
}

/**
 * Fetch the room playlist queue from Redis
 */
export async function getRedisQueue(roomCode: string): Promise<QueueItem[] | null> {
  const client = getRedisClient();
  if (!client || !roomCode) return null;

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:queue`;

  try {
    const raw = await client.get(key);
    if (!raw) return null;
    const items = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(items) ? (items as QueueItem[]) : null;
  } catch (err) {
    console.warn('[Redis] Failed to fetch queue from Redis:', err);
    return null;
  }
}

/**
 * Save the room playlist queue to Redis
 */
export async function saveRedisQueue(roomCode: string, items: QueueItem[]): Promise<boolean> {
  const client = getRedisClient();
  if (!client || !roomCode) return false;

  const room = normalizeRoomCode(roomCode);
  const key = `room:${room}:queue`;

  try {
    await client.set(key, JSON.stringify(items), { ex: ROOM_TTL_SECONDS });
    return true;
  } catch (err) {
    console.warn('[Redis] Failed to save queue to Redis:', err);
    return false;
  }
}

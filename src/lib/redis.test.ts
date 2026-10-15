import { describe, it, expect, beforeEach } from 'vitest';
import {
  publishRedisEvent,
  fetchRedisEvents,
  setRedisRoomState,
  getRedisRoomState,
  heartbeatRedisPresence,
  getRedisOnlineCount,
  saveRedisQueue,
  getRedisQueue,
  normalizeRoomCode,
  type RedisBroadcastMessage,
} from './redis-room';
import { setCustomRedisClient } from './redis';

// Create a high-fidelity in-memory mock for @upstash/redis
class MockUpstashRedis {
  public store = new Map<string, any>();
  public hashes = new Map<string, Map<string, any>>();
  public lists = new Map<string, any[]>();
  public expiries = new Map<string, number>();

  async lpush(key: string, ...values: any[]): Promise<number> {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    const list = this.lists.get(key)!;
    list.unshift(...values);
    return list.length;
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const list = this.lists.get(key) || [];
    const end = stop === -1 ? list.length : stop + 1;
    return list.slice(start, end);
  }

  async ltrim(key: string, start: number, stop: number): Promise<string> {
    const list = this.lists.get(key) || [];
    const trimmed = list.slice(start, stop === -1 ? undefined : stop + 1);
    this.lists.set(key, trimmed);
    return 'OK';
  }

  async expire(key: string, seconds: number): Promise<number> {
    this.expiries.set(key, seconds);
    return 1;
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<string> {
    this.store.set(key, value);
    if (options?.ex) {
      this.expiries.set(key, options.ex);
    }
    return 'OK';
  }

  async get(key: string): Promise<any> {
    return this.store.get(key) ?? null;
  }

  async hset(key: string, kvMap: Record<string, any>): Promise<number> {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    const hash = this.hashes.get(key)!;
    let added = 0;
    for (const [k, v] of Object.entries(kvMap)) {
      if (!hash.has(k)) added++;
      hash.set(k, v);
    }
    return added;
  }

  async hgetall(key: string): Promise<Record<string, any> | null> {
    const hash = this.hashes.get(key);
    if (!hash || hash.size === 0) return null;
    const result: Record<string, any> = {};
    for (const [k, v] of hash.entries()) {
      result[k] = v;
    }
    return result;
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    const hash = this.hashes.get(key);
    if (!hash) return 0;
    let deleted = 0;
    for (const f of fields) {
      if (hash.delete(f)) deleted++;
    }
    return deleted;
  }
}

describe('Redis Room Engine', () => {
  let mockRedis: MockUpstashRedis;

  beforeEach(() => {
    mockRedis = new MockUpstashRedis();
    setCustomRedisClient(mockRedis as any);
  });

  it('normalizes room codes to uppercase trimmed strings', () => {
    expect(normalizeRoomCode('  kanta-test  ')).toBe('KANTA-TEST');
  });

  describe('Event Publishing and Ingestion', () => {
    it('publishes events to room list and caps to 50 items', async () => {
      const msg: RedisBroadcastMessage = {
        id: 'msg_1',
        event: 'soundboard:play',
        payload: { sound: 'airhorn' },
        senderId: 'remote-1',
        timestamp: new Date().toISOString(),
      };

      const published = await publishRedisEvent('KANTA-123', msg);
      expect(published).toBe(true);

      const events = await fetchRedisEvents('KANTA-123', 10);
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('msg_1');
      expect(events[0].event).toBe('soundboard:play');
      expect(events[0].payload.sound).toBe('airhorn');
    });

    it('preserves latest events and trims older items beyond 50', async () => {
      for (let i = 0; i < 55; i++) {
        await publishRedisEvent('KANTA-123', {
          id: `msg_${i}`,
          event: 'test:event',
          payload: { index: i },
          senderId: 'client-1',
          timestamp: new Date().toISOString(),
        });
      }

      const events = await fetchRedisEvents('KANTA-123', 100);
      expect(events.length).toBeLessThanOrEqual(50);
      // Newest event was published last, so it's at index 0
      expect(events[0].id).toBe('msg_54');
    });
  });

  describe('Room State Sync', () => {
    it('saves and retrieves active playback state', async () => {
      const state = {
        nowPlaying: {
          songId: 101,
          title: 'Ang Huling El Bimbo',
          artist: 'Eraserheads',
          singerName: 'Juan',
          youtubeId: '-fCPC3ISYOg',
          startedAt: Date.now(),
          duration: 465,
        },
        isPlaying: true,
        keyOffset: 2,
        updatedAt: Date.now(),
      };

      const saved = await setRedisRoomState('KANTA-ROOM', state);
      expect(saved).toBe(true);

      const retrieved = await getRedisRoomState('KANTA-ROOM');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.nowPlaying?.title).toBe('Ang Huling El Bimbo');
      expect(retrieved?.isPlaying).toBe(true);
      expect(retrieved?.keyOffset).toBe(2);
    });
  });

  describe('Presence & Heartbeat Counting', () => {
    it('heartbeats clients and accurately counts active participants', async () => {
      // Client 1: active
      await heartbeatRedisPresence('KANTA-ROOM', {
        clientId: 'host-1',
        role: 'host',
      });

      // Client 2: active
      await heartbeatRedisPresence('KANTA-ROOM', {
        clientId: 'remote-1',
        role: 'remote',
        name: 'Maria',
      });

      const count = await getRedisOnlineCount('KANTA-ROOM', 15000);
      expect(count).toBe(2);
    });

    it('filters out stale participants older than the threshold', async () => {
      const staleTime = Date.now() - 30000; // 30s ago
      const activeTime = Date.now();

      // Manually insert one active and one stale
      await mockRedis.hset('room:KANTA-ROOM:presence', {
        'host-1': JSON.stringify({ clientId: 'host-1', role: 'host', lastSeen: activeTime }),
        'stale-1': JSON.stringify({ clientId: 'stale-1', role: 'remote', lastSeen: staleTime }),
      });

      const count = await getRedisOnlineCount('KANTA-ROOM', 15000);
      expect(count).toBe(1);
    });
  });

  describe('Queue Sync', () => {
    it('persists and retrieves queue items', async () => {
      const queue = [
        {
          id: 'q_1',
          room_code: 'KANTA-ROOM',
          song_id: 1,
          singer_name: 'Juan',
          position: 1,
          status: 'queued' as const,
          created_at: new Date().toISOString(),
        },
      ];

      const saved = await saveRedisQueue('KANTA-ROOM', queue);
      expect(saved).toBe(true);

      const retrieved = await getRedisQueue('KANTA-ROOM');
      expect(retrieved).toHaveLength(1);
      expect(retrieved?.[0].singer_name).toBe('Juan');
    });
  });

  describe('Graceful Fallback When Unconfigured', () => {
    beforeEach(() => {
      setCustomRedisClient(null);
    });

    it('safely handles unconfigured Redis without errors', async () => {
      expect(await publishRedisEvent('KANTA-TEST', {} as any)).toBe(false);
      expect(await fetchRedisEvents('KANTA-TEST')).toEqual([]);
      expect(await setRedisRoomState('KANTA-TEST', {} as any)).toBe(false);
      expect(await getRedisRoomState('KANTA-TEST')).toBeNull();
      expect(await getRedisOnlineCount('KANTA-TEST')).toBe(0);
      expect(await getRedisQueue('KANTA-TEST')).toBeNull();
      expect(await saveRedisQueue('KANTA-TEST', [])).toBe(false);
    });
  });
});

import { Redis } from '@upstash/redis';

const redisUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_UPSTASH_REDIS_REST_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_UPSTASH_REDIS_REST_URL) ||
  '';

const redisToken =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_UPSTASH_REDIS_REST_TOKEN) ||
  (typeof process !== 'undefined' && process.env?.VITE_UPSTASH_REDIS_REST_TOKEN) ||
  '';

export const isRedisConfigured = Boolean(
  redisUrl &&
  redisToken &&
  redisUrl !== 'https://your-upstash-redis.upstash.io' &&
  !redisUrl.includes('placeholder')
);

export const defaultRedis = isRedisConfigured
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

let overriddenRedis: Redis | null = null;

/**
 * Override the Redis instance for tests or custom mock clients
 */
export function setCustomRedisClient(client: Redis | null): void {
  overriddenRedis = client;
}

/**
 * Returns active Redis client if configured or overridden, otherwise null
 */
export function getRedisClient(): Redis | null {
  return overriddenRedis || defaultRedis;
}

export { Redis };

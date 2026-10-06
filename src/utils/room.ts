/**
 * Room code utilities for PinoyVideoke
 */

const ROOM_STORAGE_KEY = 'pinoyvideoke_room_code';
const PREFIXES = ['KANTA', 'OPM', 'PINOY', 'BARDA', 'SING'];

/**
 * Generate a memorable Filipino videoke room code (e.g. KANTA-88, OPM-42)
 */
export function generateRoomCode(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const num = Math.floor(10 + Math.random() * 90); // 2-digit number (10 - 99)
  return `${prefix}-${num}`;
}

/**
 * Retrieve saved room code from session storage
 */
export function getStoredRoomCode(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ROOM_STORAGE_KEY);
}

/**
 * Sanitize and format a user-provided or generated room code
 */
export function sanitizeRoomCode(code: string): string {
  if (!code) return '';
  return code
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 10);
}

/**
 * Persist room code to session storage
 */
export function setStoredRoomCode(code: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ROOM_STORAGE_KEY, sanitizeRoomCode(code));
}

/**
 * Clear stored room code
 */
export function clearStoredRoomCode(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ROOM_STORAGE_KEY);
}

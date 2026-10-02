import { supabase, isSupabaseConfigured } from './supabase';
import type { Song, QueueItem } from '../types/song';
import catalogData from '../data/songs.json';

// In-memory catalog containing all 523 CoversPH & staple karaoke songs
export const FALLBACK_SONGS: Song[] = catalogData as Song[];

function searchFallbackSongs(searchTerm = '', language?: string): Song[] {
  let results = FALLBACK_SONGS;
  if (language && language !== 'All') {
    results = results.filter((s) => s.language.toLowerCase() === language.toLowerCase());
  }
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase().trim();
    // Multi-term matching (matches if all query terms appear anywhere in title, artist, code, or tokens)
    const terms = q.split(/\s+/).filter(Boolean);
    results = results.filter((s) => {
      const searchTarget =
        `${s.code} ${s.title} ${s.artist} ${s.search_tokens || ''}`.toLowerCase();
      return terms.every((t) => searchTarget.includes(t));
    });
  }
  return results.slice(0, 100);
}

/**
 * Search songs with instant local-first search and optional Supabase query with timeout race
 */
export async function searchSongs(searchTerm = '', language?: string): Promise<Song[]> {
  const localResults = searchFallbackSongs(searchTerm, language);

  if (!isSupabaseConfigured) {
    return localResults;
  }

  try {
    const supabaseSearch = async (): Promise<Song[]> => {
      let query = supabase.from('songs').select('*');

      if (searchTerm.trim()) {
        if (/^\d{1,5}$/.test(searchTerm.trim())) {
          query = query.like('code', `%${searchTerm.trim()}%`);
        } else {
          query = query.textSearch('search_tokens', searchTerm.trim(), {
            type: 'websearch',
            config: 'english',
          });
        }
      }

      if (language && language !== 'All') {
        query = query.eq('language', language);
      }

      const { data, error } = await query.order('title', { ascending: true }).limit(50);
      if (error || !data || data.length === 0) {
        return localResults;
      }
      return data;
    };

    // Race Supabase with an aggressive 1000ms timeout so UI never freezes
    const timeout = new Promise<Song[]>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase search timeout')), 1000)
    );

    return await Promise.race([supabaseSearch(), timeout]);
  } catch {
    return localResults;
  }
}

/**
 * Fetch a single song by its 5-digit code.
 * Local catalog is checked FIRST for 0ms instantaneous keypad response.
 */
export async function getSongByCode(code: string): Promise<Song | null> {
  const localSong = FALLBACK_SONGS.find((s) => s.code === code);
  if (localSong) {
    return localSong;
  }

  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const fetchFromSupabase = async (): Promise<Song | null> => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      if (error || !data) {
        return null;
      }
      return data;
    };

    const timeout = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase code lookup timeout')), 1000)
    );

    return await Promise.race([fetchFromSupabase(), timeout]);
  } catch {
    return null;
  }
}

/**
 * Fetch active queue for a room with joined song details.
 * Local storage is checked and used as fallback if Supabase is slow or unavailable.
 */
export async function getRoomQueue(roomCode: string): Promise<QueueItem[]> {
  const getLocal = (): QueueItem[] => {
    try {
      const q = JSON.parse(localStorage.getItem(`videoke_queue_${roomCode}`) || '[]');
      return q.filter((item: QueueItem) => item.status === 'queued' || item.status === 'playing');
    } catch {
      return [];
    }
  };

  const localQueue = getLocal();

  if (!isSupabaseConfigured) {
    return localQueue;
  }

  try {
    const fetchSupabaseQueue = async (): Promise<QueueItem[]> => {
      const { data, error } = await supabase
        .from('queue_items')
        .select('*, song:songs(*)')
        .eq('room_code', roomCode)
        .in('status', ['queued', 'playing'])
        .order('position', { ascending: true });

      if (error || !data || data.length === 0) {
        return localQueue;
      }
      return (data as any) || [];
    };

    const timeout = new Promise<QueueItem[]>((_, reject) =>
      setTimeout(() => reject(new Error('Queue fetch timeout')), 1000)
    );

    return await Promise.race([fetchSupabaseQueue(), timeout]);
  } catch {
    return localQueue;
  }
}

/**
 * Add a song to the active room queue.
 * Guarantees immediate local persistence and fast return so reservation never hangs.
 */
export async function addSongToQueue(
  roomCode: string,
  songId: number,
  singerName = 'Guest'
): Promise<QueueItem | null> {
  const song = FALLBACK_SONGS.find((s) => s.id === songId);
  const localItem: QueueItem = {
    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    room_code: roomCode,
    song_id: songId,
    singer_name: singerName.trim().slice(0, 30) || 'Guest',
    position: Date.now(),
    status: 'queued',
    created_at: new Date().toISOString(),
    song: song,
  };

  const saveLocal = () => {
    try {
      const q = JSON.parse(localStorage.getItem(`videoke_queue_${roomCode}`) || '[]');
      q.push(localItem);
      localStorage.setItem(`videoke_queue_${roomCode}`, JSON.stringify(q));
      // Dispatch storage event to notify other local tabs
      window.dispatchEvent(new Event('videoke_queue_change'));
    } catch {}
  };

  // Always save locally immediately
  saveLocal();

  if (!isSupabaseConfigured) {
    return localItem;
  }

  // Attempt Supabase insert in background / race with 1200ms timeout
  try {
    const supabaseInsert = async (): Promise<QueueItem> => {
      const { data: existing }: { data: any } = await supabase
        .from('queue_items')
        .select('position')
        .eq('room_code', roomCode)
        .order('position', { ascending: false })
        .limit(1);

      const nextPos = (existing && existing[0]?.position ? Number(existing[0].position) : 0) + 1;

      const { data, error } = await (supabase.from('queue_items') as any)
        .insert({
          room_code: roomCode,
          song_id: songId,
          singer_name: singerName.trim().slice(0, 30) || 'Guest',
          position: nextPos,
          status: 'queued',
        })
        .select('*, song:songs(*)')
        .single();

      if (error || !data) {
        return localItem;
      }
      return data as any;
    };

    const timeout = new Promise<QueueItem>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase insert timeout')), 1200)
    );

    return await Promise.race([supabaseInsert(), timeout]);
  } catch {
    return localItem;
  }
}

/**
 * Remove an item from the queue
 */
export async function removeSongFromQueue(queueId: string): Promise<boolean> {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('videoke_queue_')) {
        const q = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = q.filter((item: QueueItem) => item.id !== queueId);
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
    window.dispatchEvent(new Event('videoke_queue_change'));
  } catch {}

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    await supabase.from('queue_items').delete().eq('id', queueId);
    return true;
  } catch {
    return true;
  }
}

/**
 * Move a queued song to the top of the upcoming playlist
 */
export async function moveSongToTop(roomCode: string, queueId: string): Promise<boolean> {
  // Update local storage
  try {
    const key = `videoke_queue_${roomCode}`;
    const q: QueueItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = q.findIndex((item) => item.id === queueId);
    if (idx > 1) {
      const [item] = q.splice(idx, 1);
      q.splice(1, 0, item);
      localStorage.setItem(key, JSON.stringify(q));
      window.dispatchEvent(new Event('videoke_queue_change'));
    }
  } catch {}

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    const { data: items } = await (supabase
      .from('queue_items')
      .select('id, position, status')
      .eq('room_code', roomCode)
      .in('status', ['queued', 'playing'])
      .order('position', { ascending: true }) as any);

    if (!items || items.length === 0) return false;

    const isFirstPlaying = items[0]?.status === 'playing';
    const targetPos =
      isFirstPlaying && items[1] ? items[1].position - 1 : (items[0]?.position || 1) - 1;

    await (supabase.from('queue_items') as any).update({ position: targetPos }).eq('id', queueId);
    return true;
  } catch {
    return true;
  }
}

/**
 * Mark a queued song as completed when playback finishes
 */
export async function completeSongInQueue(queueId: string): Promise<boolean> {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('videoke_queue_')) {
        const q: QueueItem[] = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = q.filter((item) => item.id !== queueId);
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
    window.dispatchEvent(new Event('videoke_queue_change'));
  } catch {}

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    await (supabase.from('queue_items') as any).update({ status: 'completed' }).eq('id', queueId);
    return true;
  } catch {
    return true;
  }
}

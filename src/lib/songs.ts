import { supabase, isSupabaseConfigured } from './supabase';
import type { Song, QueueItem } from '../types/song';

// Fallback in-memory catalog for offline testing before Supabase credentials are input
export const FALLBACK_SONGS: Song[] = [
  {
    id: 1,
    code: '01001',
    title: 'Anak',
    artist: 'Freddie Aguilar',
    language: 'Tagalog',
    youtube_id: 'n4RjJKxrfSg',
    key_offset: 0,
    duration: 235,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:14.25]Nang isilang ka sa mundong ito
[00:21.80]Laking tuwa ng magulang mo
[00:28.45]At ang kamay nila ang iyong ilaw
[00:36.10]At ang nanay at tatay mo'y
[00:41.20]Di malaman ang gagawin
[00:46.30]Minamasdan pati pagtulog mo
[00:54.10]At sa gabi'y napupuyat ang iyong nanay
[01:02.50]Sa pagtimpla ng gatas mo
[01:09.10]At sa umaga nama'y kalong ka ng iyong amang tuwang-tuwa sa 'yo`,
  },
  {
    id: 2,
    code: '01002',
    title: 'Ang Huling El Bimbo',
    artist: 'Eraserheads',
    language: 'Tagalog',
    youtube_id: 'WjK3rL4-s_4',
    key_offset: 0,
    duration: 320,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:15.50]Kamukha mo si Paraluman
[00:20.10]Nung tayo ay bata pa
[00:24.80]At ang galing-galing mong sumayaw
[00:29.20]Mapa-Boogie man o Cha-cha
[00:34.10]Ngunit ang paborito
[00:38.20]Ay ang pagsayaw mo ng El Bimbo
[00:43.10]Nakakaindak, nakakaaliw
[00:47.80]Nakakatindig-balahibo`,
  },
  {
    id: 3,
    code: '01003',
    title: 'Tala',
    artist: 'Sarah Geronimo',
    language: 'Tagalog',
    youtube_id: 'kF5A11eC4y0',
    key_offset: 0,
    duration: 250,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:18.20]Sa bawat pag-ikot ng ating mundo
[00:22.50]Pag-ibig mo ang siyang gabay ko
[00:27.10]Liwanag mo ang tanging ilaw
[00:31.40]Sa dilim ng buhay kong ligaw
[00:36.20]Tala, tala, tala
[00:40.50]Ang ningning ng mga tala`,
  },
  {
    id: 4,
    code: '01004',
    title: 'Bakit Pa',
    artist: 'Jessa Zaragoza',
    language: 'Tagalog',
    youtube_id: '5_zPzE4nQwQ',
    key_offset: 0,
    duration: 275,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:16.10]Bakit pa kita nakilala?
[00:23.20]Kung kailan ang puso ko'y may nagmamay-ari na
[00:31.40]Bakit ba kita minahal nang husto?
[00:39.10]Gayong alam kong ako'y masasaktan lang sa 'yo`,
  },
  {
    id: 5,
    code: '01005',
    title: 'My Way',
    artist: 'Frank Sinatra',
    language: 'English',
    youtube_id: 'qQzdAsjWGPg',
    key_offset: 0,
    duration: 275,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:14.20]And now, the end is near
[00:21.10]And so I face the final curtain
[00:28.40]My friend, I'll say it clear
[00:35.30]I'll state my case, of which I'm certain
[00:43.10]I've lived a life that's full
[00:49.80]I traveled each and every highway
[00:57.20]And more, much more than this
[01:05.10]I did it my way`,
  },
  {
    id: 6,
    code: '01006',
    title: 'Harana',
    artist: 'Parokya ni Edgar',
    language: 'Tagalog',
    youtube_id: '5q-Xb3t54hI',
    key_offset: 0,
    duration: 185,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:12.30]Uso pa ba ang harana?
[00:17.50]Marahil ikaw ay nagtataka
[00:23.10]Sino ba 'tong mukhang gago
[00:28.40]Nagkandarapa sa pagkanta
[00:34.20]At may dalang gitara
[00:39.10]Kahit na sintunado`,
  },
];

/**
 * Search songs with full-text search and optional language filter
 */
export async function searchSongs(searchTerm = '', language?: string): Promise<Song[]> {
  if (!isSupabaseConfigured) {
    let results = FALLBACK_SONGS;
    if (language && language !== 'All') {
      results = results.filter((s) => s.language.toLowerCase() === language.toLowerCase());
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      results = results.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.code.includes(q)
      );
    }
    return results;
  }

  let query = supabase.from('songs').select('*');

  if (searchTerm.trim()) {
    // If user typed 5 digits, match exact code
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
  if (error) {
    console.error('Failed to search songs:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch a single song by its 5-digit code
 */
export async function getSongByCode(code: string): Promise<Song | null> {
  if (!isSupabaseConfigured) {
    return FALLBACK_SONGS.find((s) => s.code === code) || null;
  }

  const { data, error } = await supabase.from('songs').select('*').eq('code', code).maybeSingle();

  if (error) {
    console.error(`Error fetching song code ${code}:`, error);
    return null;
  }
  return data;
}

/**
 * Fetch active queue for a room with joined song details
 */
export async function getRoomQueue(roomCode: string): Promise<QueueItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('queue_items')
    .select('*, song:songs(*)')
    .eq('room_code', roomCode)
    .in('status', ['queued', 'playing'])
    .order('position', { ascending: true });

  if (error) {
    console.error(`Error fetching queue for room ${roomCode}:`, error);
    return [];
  }
  return (data as any) || [];
}

/**
 * Add a song to the active room queue
 */
export async function addSongToQueue(
  roomCode: string,
  songId: number,
  singerName = 'Guest'
): Promise<QueueItem | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  // Get current max position
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

  if (error) {
    console.error('Error adding song to queue:', error);
    return null;
  }
  return data as any;
}

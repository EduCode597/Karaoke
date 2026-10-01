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
    youtube_id: 'zaYOvpl3Y1k',
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
    youtube_id: 'ih_1qXYDXO4',
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
    youtube_id: 't-R0whXGk-Y',
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
    title: 'Bakit Pa Ba',
    artist: 'Sarah Geronimo',
    language: 'Tagalog',
    youtube_id: '1v-WI4sf7Is',
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
    youtube_id: 'KwJaKOcI1c8',
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
  {
    id: 7,
    code: '01007',
    title: 'Narda',
    artist: 'Kamikazee',
    language: 'Tagalog',
    youtube_id: 'SyPPsDViSK4',
    key_offset: 0,
    duration: 280,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:18.50]Tila ibon kung lumipad
[00:23.20]Ang puso kong sumasabay sa hangin
[00:28.40]Kay sarap magmahal ng tunay
[00:33.10]Awit ng pagsuyo ay maririnig`,
  },
  {
    id: 8,
    code: '01008',
    title: 'Dancing Queen',
    artist: 'ABBA',
    language: 'English',
    youtube_id: 'xFrGuyw1V8s',
    key_offset: 0,
    duration: 230,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:19.20]You can dance, you can jive
[00:24.40]Having the time of your life
[00:28.10]See that girl, watch that scene
[00:33.20]Digging the dancing queen`,
  },
  {
    id: 9,
    code: '01009',
    title: 'Kahit Maputi Na Ang Buhok Ko',
    artist: 'Rey Valera',
    language: 'Tagalog',
    youtube_id: '5vkq4NLrNWo',
    key_offset: 0,
    duration: 210,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:15.10]Kung tayo ay matanda na
[00:21.40]Sana'y di tayo magbago
[00:27.20]Kailan man, nasaan ma'y
[00:33.50]Ito ang pangarap ko`,
  },
  {
    id: 10,
    code: '01010',
    title: 'Zombie',
    artist: 'The Cranberries',
    language: 'English',
    youtube_id: '6Ejga4kJUts',
    key_offset: 0,
    duration: 305,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:32.40]Another head hangs lowly
[00:37.10]Child is slowly taken
[00:41.50]And the violence caused such silence
[00:46.20]Who are we mistaken?`,
  },
  {
    id: 11,
    code: '01011',
    title: 'Torete',
    artist: 'Moira Dela Torre',
    language: 'Tagalog',
    youtube_id: 'fPEWDeq3R_4',
    key_offset: 0,
    duration: 240,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:15.30]Sandali na lang
[00:20.10]Maaari bang pagbigyan
[00:25.40]Aalis na nga
[00:29.80]Maaari bang hawakan
[00:34.50]Ang iyong mga kamay
[00:39.20]Sana ay maabot ng langit
[00:44.50]Ang iyong mga ngiti
[00:49.10]Sana ay masilayan
[00:54.00]Huwag kang mag-alala
[00:59.20]Di ko ipipilit sa 'yo
[01:03.50]Kahit na lilipad ang isip ko sa 'yo
[01:09.10]Torete, torete, torete ako`,
  },
  {
    id: 12,
    code: '01012',
    title: 'Total Eclipse of the Heart',
    artist: 'Bonnie Tyler',
    language: 'English',
    youtube_id: 'lcOxhH8N3Bo',
    key_offset: 0,
    duration: 330,
    search_tokens: null,
    created_at: new Date().toISOString(),
    lrc_content: `[00:16.10]Turn around, every now and then I get a little bit lonely
[00:24.40]And you're never coming 'round
[00:28.50]Turn around, every now and then I get a little bit tired
[00:36.10]Of listening to the sound of my tears`,
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

/**
 * Remove an item from the queue
 */
export async function removeSongFromQueue(queueId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return true;
  }

  const { error } = await supabase.from('queue_items').delete().eq('id', queueId);
  if (error) {
    console.error('Error removing song from queue:', error);
    return false;
  }
  return true;
}

/**
 * Move a queued song to the top of the upcoming playlist
 */
export async function moveSongToTop(roomCode: string, queueId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return true;
  }

  // Get currently playing/queued items
  const { data: items } = await (supabase
    .from('queue_items')
    .select('id, position, status')
    .eq('room_code', roomCode)
    .in('status', ['queued', 'playing'])
    .order('position', { ascending: true }) as any);

  if (!items || items.length === 0) return false;

  // If item 0 is playing, the top queued position is right after it
  const isFirstPlaying = items[0]?.status === 'playing';
  const targetPos =
    isFirstPlaying && items[1] ? items[1].position - 1 : (items[0]?.position || 1) - 1;

  const { error } = await (supabase.from('queue_items') as any)
    .update({ position: targetPos })
    .eq('id', queueId);

  if (error) {
    console.error('Error moving song to top:', error);
    return false;
  }
  return true;
}

/**
 * Mark a queued song as completed when playback finishes
 */
export async function completeSongInQueue(queueId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return true;
  }

  const { error } = await (supabase.from('queue_items') as any)
    .update({ status: 'completed' })
    .eq('id', queueId);

  if (error) {
    console.error('Error completing queue item:', error);
    return false;
  }
  return true;
}

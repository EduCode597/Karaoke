import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_SONGS = [
  {
    code: '01001',
    title: 'Anak',
    artist: 'Freddie Aguilar',
    language: 'Tagalog',
    youtube_id: 'n4RjJKxrfSg',
    duration: 235,
    key_offset: 0,
    lrc_content: `[00:14.25]Nang isilang ka sa mundong ito
[00:21.80]Laking tuwa ng magulang mo
[00:28.45]At ang kamay nila ang iyong ilaw
[00:36.10]At ang nanay at tatay mo'y
[00:41.20]Di malaman ang gagawin
[00:46.30]Minamasdan pati pagtulog mo`,
  },
  {
    code: '01002',
    title: 'Ang Huling El Bimbo',
    artist: 'Eraserheads',
    language: 'Tagalog',
    youtube_id: 'WjK3rL4-s_4',
    duration: 320,
    key_offset: 0,
    lrc_content: `[00:15.50]Kamukha mo si Paraluman
[00:20.10]Nung tayo ay bata pa
[00:24.80]At ang galing-galing mong sumayaw
[00:29.20]Mapa-Boogie man o Cha-cha
[00:34.10]Ngunit ang paborito
[00:38.20]Ay ang pagsayaw mo ng El Bimbo`,
  },
  {
    code: '01003',
    title: 'Tala',
    artist: 'Sarah Geronimo',
    language: 'Tagalog',
    youtube_id: 'kF5A11eC4y0',
    duration: 250,
    key_offset: 0,
    lrc_content: `[00:18.20]Sa bawat pag-ikot ng ating mundo
[00:22.50]Pag-ibig mo ang siyang gabay ko
[00:27.10]Liwanag mo ang tanging ilaw
[00:31.40]Sa dilim ng buhay kong ligaw
[00:36.20]Tala, tala, tala`,
  },
  {
    code: '01004',
    title: 'Bakit Pa',
    artist: 'Jessa Zaragoza',
    language: 'Tagalog',
    youtube_id: '5_zPzE4nQwQ',
    duration: 275,
    key_offset: 0,
    lrc_content: `[00:16.10]Bakit pa kita nakilala?
[00:23.20]Kung kailan ang puso ko'y may nagmamay-ari na
[00:31.40]Bakit ba kita minahal nang husto?
[00:39.10]Gayong alam kong ako'y masasaktan lang sa 'yo`,
  },
  {
    code: '01005',
    title: 'My Way',
    artist: 'Frank Sinatra',
    language: 'English',
    youtube_id: 'qQzdAsjWGPg',
    duration: 275,
    key_offset: 0,
    lrc_content: `[00:14.20]And now, the end is near
[00:21.10]And so I face the final curtain
[00:28.40]My friend, I'll say it clear
[00:35.30]I'll state my case, of which I'm certain`,
  },
  {
    code: '01006',
    title: 'Harana',
    artist: 'Parokya ni Edgar',
    language: 'Tagalog',
    youtube_id: '5q-Xb3t54hI',
    duration: 185,
    key_offset: 0,
    lrc_content: `[00:12.30]Uso pa ba ang harana?
[00:17.50]Marahil ikaw ay nagtataka
[00:23.10]Sino ba 'tong mukhang gago
[00:28.40]Nagkandarapa sa pagkanta`,
  },
  {
    code: '01007',
    title: 'Narda',
    artist: 'Kamikazee',
    language: 'Tagalog',
    youtube_id: 'xJ8M4ZlOQY4',
    duration: 280,
    key_offset: 0,
    lrc_content: `[00:18.50]Tila ibon kung lumipad
[00:23.20]Ang puso kong sumasabay sa hangin
[00:28.40]Kay sarap magmahal ng tunay
[00:33.10]Awit ng pagsuyo ay maririnig`,
  },
  {
    code: '01008',
    title: 'Dancing Queen',
    artist: 'ABBA',
    language: 'English',
    youtube_id: 'xFLx7NzPECA',
    duration: 230,
    key_offset: 0,
    lrc_content: `[00:19.20]You can dance, you can jive
[00:24.40]Having the time of your life
[00:28.10]See that girl, watch that scene
[00:33.20]Digging the dancing queen`,
  },
  {
    code: '01009',
    title: 'Kahit Maputi Na Ang Buhok Ko',
    artist: 'Rey Valera',
    language: 'Tagalog',
    youtube_id: '2H7cZ8V_uWc',
    duration: 210,
    key_offset: 0,
    lrc_content: `[00:15.10]Kung tayo ay matanda na
[00:21.40]Sana'y di tayo magbago
[00:27.20]Kailan man, nasaan ma'y
[00:33.50]Ito ang pangarap ko`,
  },
  {
    code: '01010',
    title: 'Zombie',
    artist: 'The Cranberries',
    language: 'English',
    youtube_id: '6Ejga4kJUts',
    duration: 305,
    key_offset: 0,
    lrc_content: `[00:32.40]Another head hangs lowly
[00:37.10]Child is slowly taken
[00:41.50]And the violence caused such silence
[00:46.20]Who are we mistaken?`,
  },
  {
    code: '01011',
    title: 'Pusong Bato',
    artist: 'Jovit Baldivino',
    language: 'Tagalog',
    youtube_id: 'E_Q5G7g9z6I',
    duration: 240,
    key_offset: 0,
    lrc_content: `[00:18.10]Nang ika'y ibigin ko
[00:22.40]Mundo ko'y biglang nagbago
[00:27.50]Akala ko ika'y langit
[00:31.20]Yun pala'y sakit sa puso`,
  },
  {
    code: '01012',
    title: 'Total Eclipse of the Heart',
    artist: 'Bonnie Tyler',
    language: 'English',
    youtube_id: 'lcOxhH8N3Bo',
    duration: 330,
    key_offset: 0,
    lrc_content: `[00:16.10]Turn around, every now and then I get a little bit lonely
[00:24.40]And you're never coming 'round
[00:28.50]Turn around, every now and then I get a little bit tired
[00:36.10]Of listening to the sound of my tears`,
  },
];

async function seed() {
  console.log(`🚀 Seeding ${SEED_SONGS.length} iconic songs to Supabase...`);

  for (const song of SEED_SONGS) {
    const { error } = await supabase.from('songs').upsert(
      {
        code: song.code,
        title: song.title,
        artist: song.artist,
        language: song.language,
        youtube_id: song.youtube_id,
        duration: song.duration,
        key_offset: song.key_offset,
        lrc_content: song.lrc_content,
      },
      { onConflict: 'code' }
    );

    if (error) {
      console.error(`❌ Failed to seed ${song.code} - ${song.title}:`, error.message);
    } else {
      console.log(`✅ Seeded [${song.code}] ${song.title} - ${song.artist}`);
    }
  }

  console.log('🎉 Seeding complete!');
}

seed();

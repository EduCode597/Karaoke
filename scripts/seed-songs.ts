import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import songsData from '../src/data/songs.json';

// Simple inline .env loader
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      const val = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SongRecord {
  id: number;
  code: string;
  title: string;
  artist: string;
  language: string;
  youtube_id: string;
  duration: number;
  key_offset: number;
  lrc_content?: string | null;
}

async function seed() {
  const songs = songsData as SongRecord[];
  console.log(`🚀 Seeding ${songs.length} verified videoke tracks to Supabase...`);

  const batchSize = 50;
  let totalSeeded = 0;

  for (let i = 0; i < songs.length; i += batchSize) {
    const batch = songs.slice(i, i + batchSize).map((s) => ({
      id: s.id,
      code: s.code,
      title: s.title,
      artist: s.artist,
      language: s.language,
      youtube_id: s.youtube_id,
      duration: s.duration,
      key_offset: s.key_offset || 0,
      lrc_content: s.lrc_content || null,
    }));

    const { error } = await supabase.from('songs').upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Batch error (${i} to ${i + batch.length}):`, error.message);
    } else {
      totalSeeded += batch.length;
      console.log(`✅ Seeded batch: ${totalSeeded}/${songs.length} songs`);
    }
  }

  console.log(`🎉 Seeding complete! ${totalSeeded} songs live in Supabase.`);
}

seed();

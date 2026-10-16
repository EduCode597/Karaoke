import assert from 'assert';
import { hydrateQueueItem, FALLBACK_SONGS } from './songs';
import type { QueueItem } from '../types/song';

console.log('--- Testing Queue Hydration & Resiliency ---');

// Test 1: Item with missing song object is hydrated from FALLBACK_SONGS by song_id
const unhydratedItem: QueueItem = {
  id: 'test_item_1',
  room_code: 'KANTA-SYNC',
  song_id: 1, // Ang Huling El Bimbo
  singer_name: 'FriendInNY',
  position: 1,
  status: 'queued',
  created_at: new Date().toISOString(),
};

const hydrated = hydrateQueueItem(unhydratedItem);
assert(hydrated.song !== undefined, 'Hydrated item should have song object');
assert.strictEqual(hydrated.song?.title, 'Ang Huling El Bimbo');
assert.strictEqual(hydrated.song?.youtube_id, '-fCPC3ISYOg');
assert.strictEqual(hydrated.song?.duration, 465);
console.log('✓ Test 1: Missing song object successfully hydrated by song_id');

// Test 2: Item with partial song missing youtube_id is enriched
const partialItem: QueueItem = {
  id: 'test_item_2',
  room_code: 'KANTA-SYNC',
  song_id: 2, // Kahit Maputi na ang Buhok ko
  singer_name: 'FriendInManila',
  position: 2,
  status: 'queued',
  created_at: new Date().toISOString(),
  song: {
    id: 2,
    code: '01002',
    title: 'Kahit Maputi na ang Buhok ko',
    artist: 'Rey Valera',
    language: 'Tagalog',
    youtube_id: '', // missing / blank
    duration: 0,
    created_at: '',
    key_offset: 0,
    lrc_content: null,
    search_tokens: null,
  },
};

const hydratedPartial = hydrateQueueItem(partialItem);
assert.strictEqual(hydratedPartial.song?.youtube_id, 'QhPDWgxtaAY');
console.log('✓ Test 2: Incomplete song object repaired with valid youtube_id');

// Test 3: Catalog verification - all 641 songs have valid youtube_id and unique codes
assert.strictEqual(FALLBACK_SONGS.length, 641, 'Catalog should contain exactly 641 songs');
const songsMissingYt = FALLBACK_SONGS.filter((s) => !s.youtube_id || s.youtube_id.trim() === '');
assert.strictEqual(songsMissingYt.length, 0, 'Every song in catalog must have a valid youtube_id');

const uniqueCodes = new Set(FALLBACK_SONGS.map((s) => s.code));
assert.strictEqual(uniqueCodes.size, 641, 'Every song must have a unique 5-digit code');

const uniqueIds = new Set(FALLBACK_SONGS.map((s) => s.id));
assert.strictEqual(uniqueIds.size, 641, 'Every song must have a unique numeric ID');
console.log('✓ Test 3: All 641 catalog songs have valid youtube_id, unique codes, and unique IDs');

// Test 4: Hydration of newly added Female Key songs
const femaleKeyItem: QueueItem = {
  id: 'test_item_female_key',
  room_code: 'KANTA-SYNC',
  song_id: 524, // Yakap sa Dilim (Female Key)
  singer_name: 'Maria',
  position: 3,
  status: 'queued',
  created_at: new Date().toISOString(),
};

const hydratedFemaleKey = hydrateQueueItem(femaleKeyItem);
assert(hydratedFemaleKey.song !== undefined, 'Female key item should be hydrated');
assert.strictEqual(hydratedFemaleKey.song?.title, 'Yakap sa Dilim (Female Key)');
assert.strictEqual(hydratedFemaleKey.song?.code, '02001');
assert.strictEqual(hydratedFemaleKey.song?.youtube_id, 'xsCIKmWdMws');
console.log('✓ Test 4: Female key song (02001) successfully hydrated');

// Test 5: Verify all 118 female key songs have 02xxx codes and valid metadata
const femaleKeyTracks = FALLBACK_SONGS.filter((s) => s.id >= 524);
assert.strictEqual(femaleKeyTracks.length, 118, 'There should be 118 new female key tracks');
assert(
  femaleKeyTracks.every((s) => s.code.startsWith('02')),
  'All new tracks should have 02xxx codes'
);
console.log('✓ Test 5: All 118 female key songs verified with 02xxx videoke codes');

console.log('🎉 All Queue Sync & Hydration tests passed successfully!');

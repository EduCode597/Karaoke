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

// Test 3: Catalog verification - all 523 songs have valid youtube_id
const songsMissingYt = FALLBACK_SONGS.filter((s) => !s.youtube_id || s.youtube_id.trim() === '');
assert.strictEqual(songsMissingYt.length, 0, 'Every song in catalog must have a valid youtube_id');
console.log('✓ Test 3: All 523 catalog songs have valid youtube_id for player playback');

console.log('🎉 All Queue Sync & Hydration tests passed successfully!');

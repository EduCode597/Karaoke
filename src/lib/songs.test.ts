import { searchSongs, FALLBACK_SONGS } from './songs';

async function runTests() {
  console.log('--- Testing Songbook Catalog Retrieval ---');

  // Test 1: All songs should return all 523 tracks, not truncated to 50 or 100
  const allSongs = await searchSongs('', 'All');
  console.log(
    `Test 1: 'All' category count: ${allSongs.length} (expected: ${FALLBACK_SONGS.length})`
  );
  if (allSongs.length !== FALLBACK_SONGS.length) {
    throw new Error(
      `FAILED: Expected all ${FALLBACK_SONGS.length} songs to be presented in 'All' section, but got ${allSongs.length}`
    );
  }
  console.log('✓ All songs presented correctly without artificial limit truncation.');

  // Test 2: Tagalog songs should return all 106 tracks
  const tagalogSongs = await searchSongs('', 'Tagalog');
  const expectedTagalog = FALLBACK_SONGS.filter(
    (s) => s.language.toLowerCase() === 'tagalog'
  ).length;
  console.log(`Test 2: 'Tagalog' count: ${tagalogSongs.length} (expected: ${expectedTagalog})`);
  if (tagalogSongs.length !== expectedTagalog) {
    throw new Error(
      `FAILED: Expected ${expectedTagalog} Tagalog songs, but got ${tagalogSongs.length}`
    );
  }
  console.log('✓ Tagalog songs presented completely.');

  // Test 3: English songs should return all 417 tracks
  const englishSongs = await searchSongs('', 'English');
  const expectedEnglish = FALLBACK_SONGS.filter(
    (s) => s.language.toLowerCase() === 'english'
  ).length;
  console.log(`Test 3: 'English' count: ${englishSongs.length} (expected: ${expectedEnglish})`);
  if (englishSongs.length !== expectedEnglish) {
    throw new Error(
      `FAILED: Expected ${expectedEnglish} English songs, but got ${englishSongs.length}`
    );
  }
  console.log('✓ English songs presented completely.');

  // Test 4: Search filtering still functions
  const searchResults = await searchSongs('El Bimbo');
  if (
    searchResults.length === 0 ||
    !searchResults.some((s) => s.title.toLowerCase().includes('bimbo'))
  ) {
    throw new Error('FAILED: Search for "El Bimbo" should return matching songs');
  }
  console.log(
    `✓ Search filtering working properly: found ${searchResults.length} matches for "El Bimbo".`
  );

  console.log('All Songbook Catalog tests PASSED successfully! 🎵');
}

runTests().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

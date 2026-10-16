import { describe, it, expect } from 'vitest';
import {
  getAlphabetKey,
  sortSongsAlphabetically,
  calculateLetterCounts,
  ALPHABET_KEYS,
} from './alphabet';
import { searchSongs, FALLBACK_SONGS } from '../lib/songs';
import type { Song } from '../types/song';

const MOCK_SONGS: Song[] = [
  {
    id: 1,
    code: '01001',
    title: 'Ang Huling El Bimbo',
    artist: 'Eraserheads',
    language: 'Tagalog',
    youtube_id: 'test1',
    lrc_content: null,
    key_offset: 0,
    duration: 300,
    search_tokens: 'ang huling el bimbo',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    code: '01002',
    title: '214',
    artist: 'Rivermaya',
    language: 'Tagalog',
    youtube_id: 'test2',
    lrc_content: null,
    key_offset: 0,
    duration: 250,
    search_tokens: '214 rivermaya',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    code: '01003',
    title: "(I Can't Get No) Satisfaction",
    artist: 'The Rolling Stones',
    language: 'English',
    youtube_id: 'test3',
    lrc_content: null,
    key_offset: 0,
    duration: 230,
    search_tokens: 'satisfaction rolling stones',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    code: '01004',
    title: 'Beer',
    artist: 'Itchyworms',
    language: 'Tagalog',
    youtube_id: 'test4',
    lrc_content: null,
    key_offset: 0,
    duration: 210,
    search_tokens: 'beer itchyworms',
    created_at: new Date().toISOString(),
  },
];

describe('Alphabetical Utility & Categorization', () => {
  it('correctly extracts uppercase index key for normal and punctuation-prefixed titles', () => {
    expect(getAlphabetKey('Ang Huling El Bimbo')).toBe('A');
    expect(getAlphabetKey('beer')).toBe('B');
    expect(getAlphabetKey("(I Can't Get No) Satisfaction")).toBe('I');
    expect(getAlphabetKey('"Til Death Do Us Part"')).toBe('T');
    expect(getAlphabetKey('214')).toBe('#');
    expect(getAlphabetKey('12:51')).toBe('#');
    expect(getAlphabetKey('   ...Zombie')).toBe('Z');
    expect(getAlphabetKey('')).toBe('#');
    expect(getAlphabetKey(null)).toBe('#');
    expect(getAlphabetKey(undefined)).toBe('#');
  });

  it('ALPHABET_KEYS includes All, # and letters A through Z', () => {
    expect(ALPHABET_KEYS[0]).toBe('All');
    expect(ALPHABET_KEYS[1]).toBe('#');
    expect(ALPHABET_KEYS[2]).toBe('A');
    expect(ALPHABET_KEYS[ALPHABET_KEYS.length - 1]).toBe('Z');
    expect(ALPHABET_KEYS.length).toBe(28); // All + # + 26 letters
  });

  it('sorts songs alphabetically by title (A-Z)', () => {
    const sorted = sortSongsAlphabetically(MOCK_SONGS, 'title', 'asc');
    expect(sorted[0].title).toBe('214');
    expect(sorted[1].title).toBe('Ang Huling El Bimbo');
    expect(sorted[2].title).toBe('Beer');
    expect(sorted[3].title).toBe("(I Can't Get No) Satisfaction");
  });

  it('sorts songs alphabetically by artist (A-Z)', () => {
    const sorted = sortSongsAlphabetically(MOCK_SONGS, 'artist', 'asc');
    // Eraserheads, Itchyworms, Rivermaya, The Rolling Stones
    expect(sorted[0].artist).toBe('Eraserheads');
    expect(sorted[1].artist).toBe('Itchyworms');
    expect(sorted[2].artist).toBe('Rivermaya');
    expect(sorted[3].artist).toBe('The Rolling Stones');
  });

  it('accurately calculates letter counts for a catalog', () => {
    const counts = calculateLetterCounts(MOCK_SONGS, 'title');
    expect(counts['#']).toBe(1); // '214'
    expect(counts['A']).toBe(1); // 'Ang Huling El Bimbo'
    expect(counts['B']).toBe(1); // 'Beer'
    expect(counts['I']).toBe(1); // '(I Can't Get No) Satisfaction'
    expect(counts['C']).toBeUndefined();
  });

  it('computes letter counts for the full 523 songs catalog', () => {
    const fullCounts = calculateLetterCounts(FALLBACK_SONGS, 'title');
    const totalCounted = Object.values(fullCounts).reduce((a, b) => a + b, 0);
    expect(totalCounted).toBe(523);
    expect(fullCounts['#']).toBeGreaterThan(0);
    expect(fullCounts['A']).toBeGreaterThan(0);
    expect(fullCounts['T']).toBeGreaterThan(0);
  });
});

describe('Song Search with Alphabetical Filtering', () => {
  it('filters catalog songs by letter A', async () => {
    const songsA = await searchSongs('', 'All', { letter: 'A', sortBy: 'title' });
    expect(songsA.length).toBeGreaterThan(0);
    songsA.forEach((s) => {
      expect(getAlphabetKey(s.title)).toBe('A');
    });
  });

  it('filters catalog songs by letter # (numeric/symbols)', async () => {
    const songsHash = await searchSongs('', 'All', { letter: '#', sortBy: 'title' });
    expect(songsHash.length).toBeGreaterThan(0);
    songsHash.forEach((s) => {
      expect(getAlphabetKey(s.title)).toBe('#');
    });
  });

  it('filters catalog songs by artist letter E', async () => {
    const songsE = await searchSongs('', 'All', {
      letter: 'E',
      sortBy: 'artist',
      sortOrder: 'asc',
    });
    expect(songsE.length).toBeGreaterThan(0);
    songsE.forEach((s) => {
      expect(getAlphabetKey(s.artist)).toBe('E');
    });
  });

  it('preserves all songs when letter is All', async () => {
    const allSongs = await searchSongs('', 'All', { letter: 'All' });
    expect(allSongs.length).toBe(FALLBACK_SONGS.length);
  });
});

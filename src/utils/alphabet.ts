import type { Song } from '../types/song';

export const ALPHABET_KEYS = [
  'All',
  '#',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export type AlphabetKey = (typeof ALPHABET_KEYS)[number];

/**
 * Extracts the single uppercase index letter for alphabetical categorization.
 * Strips leading punctuation and quotes (e.g. "(I Can't Get No) Satisfaction" -> "I").
 * Non-alphabetic starting characters (numbers, symbols) map to "#".
 */
export function getAlphabetKey(str: string | null | undefined): string {
  if (!str) return '#';
  // Strip leading non-alphanumeric punctuation/whitespace/quotes/brackets
  const clean = str.trim().replace(/^[^a-zA-Z0-9]+/, '');
  if (!clean) return '#';
  const first = clean.charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

/**
 * Sorts songs alphabetically by title or artist, ignoring leading punctuation.
 */
export function sortSongsAlphabetically(
  songs: Song[],
  sortBy: 'title' | 'artist' = 'title',
  sortOrder: 'asc' | 'desc' = 'asc'
): Song[] {
  return [...songs].sort((a, b) => {
    const rawA = (sortBy === 'artist' ? a.artist : a.title) || '';
    const rawB = (sortBy === 'artist' ? b.artist : b.title) || '';

    // Strip leading non-alphanumeric punctuation (quotes, brackets) for true alphabetical ordering
    const cleanA = rawA.trim().replace(/^[^a-zA-Z0-9]+/, '');
    const cleanB = rawB.trim().replace(/^[^a-zA-Z0-9]+/, '');

    const cmp = cleanA.localeCompare(cleanB, undefined, {
      sensitivity: 'base',
      numeric: true,
    });

    if (cmp !== 0) {
      return sortOrder === 'asc' ? cmp : -cmp;
    }

    // Tie-breaker: other field or code
    const secondaryA = (sortBy === 'artist' ? a.title : a.artist) || '';
    const secondaryB = (sortBy === 'artist' ? b.title : b.artist) || '';
    const secondaryCmp = secondaryA.localeCompare(secondaryB, undefined, {
      sensitivity: 'base',
      numeric: true,
    });

    if (secondaryCmp !== 0) {
      return sortOrder === 'asc' ? secondaryCmp : -secondaryCmp;
    }

    return a.code.localeCompare(b.code);
  });
}

/**
 * Calculates counts of songs available for each letter given a base song list.
 */
export function calculateLetterCounts(
  songs: Song[],
  sortBy: 'title' | 'artist' = 'title'
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const song of songs) {
    const key = getAlphabetKey(sortBy === 'artist' ? song.artist : song.title);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

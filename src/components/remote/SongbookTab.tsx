import { useState, useEffect, useTransition } from 'react';
import { Search, Music, Mic2, X, Clock, Globe, Grid3X3, Sparkles } from 'lucide-react';
import { searchSongs } from '../../lib/songs';
import type { Song } from '../../types/song';

interface SongbookTabProps {
  onSelectSong: (song: Song) => void;
  onLoadIntoKeypad?: (code: string) => void;
}

const CATEGORIES = [
  { id: 'All', label: '⭐ All Songs (523)' },
  { id: 'Tagalog', label: '🇵🇭 Tagalog / OPM (106)' },
  { id: 'English', label: '🌐 English (417)' },
] as const;

export default function SongbookTab({ onSelectSong, onLoadIntoKeypad }: SongbookTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Load and filter songs with fast debounce
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchSongs(
          searchTerm,
          selectedCategory === 'All' ? undefined : selectedCategory
        );
        if (!isCancelled) {
          startTransition(() => {
            setSongs(results);
            setLoading(false);
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching songbook:', err);
          setLoading(false);
        }
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '3:30';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-24">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, artist, or 5-digit code (e.g. 01001)..."
            aria-label="Search song catalog"
            className="w-full pl-10 pr-9 py-3 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-sm text-white placeholder:text-slate-500 font-mono transition-all shadow-inner focus:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all touch-manipulation flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-neon-cyan scale-[1.02]'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Showing <strong className="text-cyan-400 font-bold">{songs.length}</strong> songs
            {selectedCategory !== 'All' && (
              <span>
                {' '}
                in <strong className="text-slate-200">{selectedCategory}</strong>
              </span>
            )}
            {searchTerm.trim() && (
              <span>
                {' '}
                matching "<strong className="text-slate-200">{searchTerm.trim()}</strong>"
              </span>
            )}
          </span>
        </span>
        {searchTerm.trim() && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-4 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Responsive Song Grid: 1 col on mobile, 2 cols on tablet, 3-4 cols on large screens */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 flex flex-col justify-between gap-3 animate-pulse min-h-[140px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-16 h-6 rounded-lg bg-slate-800" />
                <div className="w-24 h-5 rounded-md bg-slate-800" />
              </div>
              <div className="space-y-2 my-1">
                <div className="w-3/4 h-5 rounded bg-slate-800" />
                <div className="w-1/2 h-4 rounded bg-slate-800" />
              </div>
              <div className="w-full h-9 rounded-xl bg-slate-800/80 mt-1" />
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500">
            <Music className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-white">No songs found</h4>
          <p className="text-xs text-slate-400 font-mono max-w-sm">
            We couldn't find any songs matching "{searchTerm}". Try another keyword, artist name, or
            clear the search filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 border border-cyan-500/30 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {songs.map((song) => (
            <div
              key={song.id}
              className="group relative rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 p-4 transition-all duration-200 hover:shadow-[0_4px_24px_rgba(6,182,212,0.18)] hover:-translate-y-0.5 flex flex-col justify-between gap-3 shadow-lg backdrop-blur-sm"
            >
              {/* Card Top: Code Badge & Metadata */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onLoadIntoKeypad && onLoadIntoKeypad(song.code)}
                  title="Tap to load code into keypad"
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-400/40 hover:border-amber-400 text-amber-400 font-digital font-bold text-xs sm:text-sm tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_8px_rgba(251,191,36,0.15)] shrink-0"
                >
                  {song.code}
                </button>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 flex items-center gap-1 border border-slate-700/50">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    {song.language}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-400 flex items-center gap-1 border border-slate-700/50">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>

              {/* Card Middle: Title & Artist */}
              <div className="min-w-0 my-0.5">
                <h4
                  className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors truncate"
                  title={song.title}
                >
                  {song.title}
                </h4>
                <p
                  className="text-xs sm:text-sm text-slate-400 truncate mt-0.5"
                  title={song.artist}
                >
                  {song.artist}
                </p>
              </div>

              {/* Card Bottom: Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 mt-auto">
                {onLoadIntoKeypad && (
                  <button
                    type="button"
                    onClick={() => onLoadIntoKeypad(song.code)}
                    className="px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/50 text-slate-400 hover:text-amber-400 text-xs font-mono flex items-center justify-center gap-1 transition-all active:scale-95"
                    title="Load code into 3x4 Keypad"
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span className="hidden min-[400px]:inline">Keypad</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectSong(song)}
                  className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_16px_rgba(6,182,212,0.4)] active:scale-95 transition-all touch-manipulation"
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>Reserve</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

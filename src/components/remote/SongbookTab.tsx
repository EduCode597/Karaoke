import { useState, useEffect, useTransition } from 'react';
import { Search, Music, Mic2, X, Clock, Globe } from 'lucide-react';
import { searchSongs } from '../../lib/songs';
import type { Song } from '../../types/song';

interface SongbookTabProps {
  onSelectSong: (song: Song) => void;
  onLoadIntoKeypad?: (code: string) => void;
}

const CATEGORIES = ['All', 'Tagalog', 'English'] as const;

export default function SongbookTab({ onSelectSong, onLoadIntoKeypad }: SongbookTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Load and filter songs with debounce
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
    }, 250);

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
    <div className="flex flex-col gap-4 w-full pb-20">
      {/* Search Header */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, artist, or 5-digit code..."
          className="w-full pl-10 pr-9 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:outline-none text-sm text-white placeholder:text-slate-500 font-mono transition-colors shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all touch-manipulation ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-black font-bold shadow-neon-cyan'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat === 'All' ? '⭐ All Songs' : cat === 'Tagalog' ? '🇵🇭 Tagalog / OPM' : '🌐 English'}
          </button>
        ))}
      </div>

      {/* Song List Content */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500 font-mono text-xs">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Searching song catalog...</span>
          </div>
        ) : songs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center flex flex-col items-center gap-3">
            <Music className="w-8 h-8 text-slate-600" />
            <h4 className="text-sm font-bold text-white">No songs found</h4>
            <p className="text-xs text-slate-400 font-mono max-w-xs">
              Try searching with another keyword, artist name, or clear the search filter.
            </p>
          </div>
        ) : (
          songs.map((song) => (
            <div
              key={song.id}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-md"
            >
              {/* Song Code Badge */}
              <button
                type="button"
                onClick={() => onLoadIntoKeypad && onLoadIntoKeypad(song.code)}
                title="Load code into keypad"
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-amber-400/40 hover:border-amber-400 text-amber-400 font-digital font-bold text-sm tracking-wider shrink-0 transition-transform active:scale-95"
              >
                {song.code}
              </button>

              {/* Title & Artist */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{song.title}</h4>
                <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    {song.language}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>

              {/* Reserve Button */}
              <button
                onClick={() => onSelectSong(song)}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 active:scale-95 text-black font-mono font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-neon-cyan transition-transform touch-manipulation"
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>Reserve</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Music,
  User,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { ALPHABET_KEYS, AlphabetKey } from '../../utils/alphabet';

export interface AlphabetNavProps {
  selectedLetter: string;
  onSelectLetter: (letter: string) => void;
  letterCounts: Record<string, number>;
  totalCount: number;
  sortBy: 'title' | 'artist';
  onSortByChange?: (sortBy: 'title' | 'artist') => void;
  className?: string;
  compact?: boolean;
}

export default function AlphabetNav({
  selectedLetter,
  onSelectLetter,
  letterCounts,
  totalCount,
  sortBy,
  onSortByChange,
  className = '',
  compact = false,
}: AlphabetNavProps) {
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // Scroll ribbon horizontally on arrow click
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollTrackRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Letters available with songs for quick next/prev jumps
  const availableLetters = ALPHABET_KEYS.filter((key) => {
    if (key === 'All') return true;
    return (letterCounts[key] || 0) > 0;
  });

  const currentIndex = availableLetters.indexOf(selectedLetter as AlphabetKey);
  const prevLetter = currentIndex > 0 ? availableLetters[currentIndex - 1] : null;
  const nextLetter =
    currentIndex >= 0 && currentIndex < availableLetters.length - 1
      ? availableLetters[currentIndex + 1]
      : null;

  return (
    <div
      role="region"
      aria-label="Alphabetical song navigation"
      className={`rounded-2xl bg-slate-950/80 border border-slate-800/80 p-2 sm:p-2.5 backdrop-blur-md shadow-xl flex flex-col gap-2.5 transition-all ${className}`}
    >
      {/* Top Bar: Sort Mode Toggle & Active Letter Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        {/* Left: Categorization Mode (By Title vs By Artist) */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold hidden sm:inline">
            Index Mode:
          </span>
          {onSortByChange ? (
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => onSortByChange('title')}
                title="Categorize alphabetically by Song Title"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all touch-manipulation ${
                  sortBy === 'title'
                    ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Music className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">Title A–Z</span>
              </button>
              <button
                type="button"
                onClick={() => onSortByChange('artist')}
                title="Categorize alphabetically by Artist Name"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all touch-manipulation ${
                  sortBy === 'artist'
                    ? 'bg-slate-800 text-cyan-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px]">Artist A–Z</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Music className="w-3 h-3 text-amber-400" />
              <span>Alphabetical Index</span>
            </span>
          )}
        </div>

        {/* Right: Active Letter Badge & Quick Navigation Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {selectedLetter !== 'All' ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-amber-300 font-bold bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span>Letter</span>
                <strong className="text-amber-400 text-sm font-digital">{selectedLetter}</strong>
                <span className="text-slate-400 font-normal">
                  ({letterCounts[selectedLetter] || 0})
                </span>
              </span>

              {/* Prev / Next Letter Jumpers */}
              {prevLetter && (
                <button
                  type="button"
                  onClick={() => onSelectLetter(prevLetter)}
                  title={`Previous letter: ${prevLetter}`}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-mono flex items-center gap-0.5 touch-manipulation"
                >
                  <ArrowLeft className="w-3 h-3 text-slate-400" />
                  <span className="hidden min-[480px]:inline">{prevLetter}</span>
                </button>
              )}
              {nextLetter && (
                <button
                  type="button"
                  onClick={() => onSelectLetter(nextLetter)}
                  title={`Next letter: ${nextLetter}`}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-mono flex items-center gap-0.5 touch-manipulation"
                >
                  <span className="hidden min-[480px]:inline">{nextLetter}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              )}

              {/* Clear Filter button */}
              <button
                type="button"
                onClick={() => onSelectLetter('All')}
                title="Reset to All Songs"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all text-xs font-mono touch-manipulation"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">All</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>
                All <strong className="text-slate-200 font-digital">{totalCount}</strong> Tracks A–Z
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Alphabet Chips Ribbon Track */}
      <div className="relative flex items-center">
        {/* Scroll Left Helper Button (Desktop / Tablet) */}
        {!compact && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll alphabet letters left"
            className="hidden sm:flex items-center justify-center w-7 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white shrink-0 mr-1 transition-all touch-manipulation shadow-md z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollTrackRef}
          role="tablist"
          aria-label="Alphabet letter filters"
          className="flex-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 touch-manipulation"
        >
          {ALPHABET_KEYS.map((letter) => {
            const isAll = letter === 'All';
            const count = isAll ? totalCount : letterCounts[letter] || 0;
            const isSelected = selectedLetter === letter;
            const isDisabled = !isAll && count === 0;

            return (
              <button
                key={letter}
                type="button"
                role="tab"
                aria-selected={isSelected}
                disabled={isDisabled}
                onClick={() => onSelectLetter(letter)}
                title={
                  isAll
                    ? `Show all ${totalCount} songs`
                    : isDisabled
                      ? `No songs starting with ${letter}`
                      : `Show ${count} songs starting with ${letter}`
                }
                className={`group relative shrink-0 flex flex-col items-center justify-center rounded-xl font-mono transition-all duration-200 touch-manipulation select-none ${
                  compact
                    ? 'min-w-[34px] h-9 px-1.5 text-xs'
                    : 'min-w-[38px] sm:min-w-[42px] h-10 px-2 text-xs sm:text-sm'
                } ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-black shadow-neon-amber ring-2 ring-amber-400/50 scale-105 z-10'
                    : isDisabled
                      ? 'bg-slate-950/40 border border-slate-900/60 text-slate-600 opacity-25 cursor-not-allowed pointer-events-none'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-400/50 hover:bg-slate-850 active:scale-95'
                }`}
              >
                {/* Main Letter Label */}
                <span
                  className={`leading-none font-bold ${
                    isSelected ? 'text-slate-950' : 'text-slate-200 group-hover:text-amber-300'
                  }`}
                >
                  {letter}
                </span>

                {/* Micro Track Count Pill */}
                <span
                  className={`text-[9px] font-mono leading-none mt-0.5 tabular-nums ${
                    isSelected
                      ? 'text-slate-900 font-bold opacity-80'
                      : isDisabled
                        ? 'text-slate-700'
                        : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {isAll ? 'ALL' : count}
                </span>

                {/* Subtle active indicator dot */}
                {isSelected && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Helper Button (Desktop / Tablet) */}
        {!compact && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll alphabet letters right"
            className="hidden sm:flex items-center justify-center w-7 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white shrink-0 ml-1 transition-all touch-manipulation shadow-md z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

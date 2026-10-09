import { Music, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import type { Song } from '../../types/song';

interface LedDisplayProps {
  digits: string;
  matchedSong: Song | null;
  loading: boolean;
  onClear: () => void;
  onQuickReserve?: (song: Song) => void;
}

export default function LedDisplay({
  digits,
  matchedSong,
  loading,
  onClear,
  onQuickReserve,
}: LedDisplayProps) {
  // Pad digits up to 5 slots
  const slots = [0, 1, 2, 3, 4].map((i) => digits[i] || '_');

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800/80 p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 relative overflow-hidden">
      {/* Ambient background glow behind display */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/10 blur-2xl pointer-events-none rounded-full" />

      {/* Top Header Label */}
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-neon-amber" />
          <span className="font-bold text-amber-300">5-DIGIT MACHINE KEYPAD</span>
        </div>
        <div className="flex items-center gap-2">
          {digits.length > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] text-slate-400 hover:text-rose-400 uppercase tracking-widest px-2 py-0.5 rounded bg-slate-900 border border-slate-800 transition-colors"
            >
              Reset
            </button>
          )}
          <span className="text-slate-400 font-digital font-bold px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800/80">
            {digits.length}/5 DIGITS
          </span>
        </div>
      </div>

      {/* Recessed 5-Digit Glowing Display Readout Chassis */}
      <div className="relative p-2.5 sm:p-3 rounded-2xl bg-black/90 border border-amber-500/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] z-10">
        {/* Subtle grid scan lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:8px_8px] rounded-2xl pointer-events-none" />

        <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 relative z-10">
          {slots.map((char, index) => {
            const isFilled = char !== '_';
            const isCursor = index === digits.length && digits.length < 5;

            return (
              <div
                key={index}
                className={`w-12 h-16 sm:w-14 sm:h-20 rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-digital font-black transition-all select-none ${
                  isFilled
                    ? 'bg-gradient-to-b from-amber-950/70 to-slate-950 border border-amber-400/90 text-amber-300 text-glow-amber shadow-neon-amber'
                    : isCursor
                      ? 'bg-slate-900/40 border border-amber-400/50 text-amber-500/40 animate-pulse'
                      : 'bg-slate-950/60 border border-slate-800/80 text-slate-800'
                }`}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Song Preview & Resolution Status Card */}
      <div className="min-h-[58px] rounded-2xl bg-slate-900/90 border border-slate-800/90 p-2.5 sm:p-3 flex items-center justify-between gap-3 relative z-10 shadow-md">
        {loading ? (
          <div className="flex items-center gap-2.5 text-xs font-mono text-cyan-300 animate-pulse w-full justify-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Scanning 523 song catalog...</span>
          </div>
        ) : matchedSong ? (
          <div className="flex items-center justify-between w-full gap-2.5">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-neon-cyan">
                <Music className="w-5 h-5" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                    {matchedSong.title}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 shrink-0">
                    {matchedSong.language}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{matchedSong.artist}</p>
              </div>
            </div>

            {/* Instant Reserve button directly in preview */}
            {onQuickReserve && (
              <button
                onClick={() => onQuickReserve(matchedSong)}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-95 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-neon-cyan active:scale-95 transition-all touch-manipulation min-h-[40px]"
              >
                <span>Reserve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : digits.length === 5 ? (
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 w-full justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Code {digits} was not found in catalog</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full text-xs font-mono text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Type 5 digits to select a song (e.g. 01001)</span>
          </div>
        )}
      </div>
    </div>
  );
}

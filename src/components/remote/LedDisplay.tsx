import { Music, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Song } from '../../types/song';

interface LedDisplayProps {
  digits: string;
  matchedSong: Song | null;
  loading: boolean;
  onClear: () => void;
}

export default function LedDisplay({ digits, matchedSong, loading }: LedDisplayProps) {
  // Pad digits up to 5 slots
  const slots = [0, 1, 2, 3, 4].map((i) => digits[i] || '_');

  return (
    <div className="w-full rounded-2xl bg-slate-950 border-2 border-slate-800 p-4 shadow-xl flex flex-col gap-3">
      {/* Top Header Label */}
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
          5-Digit Numeric Entry
        </span>
        <span className="text-slate-500 font-digital">{digits.length}/5 Digits</span>
      </div>

      {/* 5-Digit Glowing Display Readout */}
      <div className="flex items-center justify-center gap-2 py-2">
        {slots.map((char, index) => {
          const isFilled = char !== '_';
          const isCursor = index === digits.length && digits.length < 5;

          return (
            <div
              key={index}
              className={`w-12 h-16 rounded-xl flex items-center justify-center text-3xl font-digital font-black transition-all ${
                isFilled
                  ? 'bg-slate-900 border-2 border-amber-400/80 text-amber-300 text-glow-amber shadow-neon-amber'
                  : isCursor
                    ? 'bg-slate-900/60 border-2 border-amber-400/40 text-amber-500/40 animate-pulse'
                    : 'bg-slate-900/40 border border-slate-800 text-slate-700'
              }`}
            >
              {char}
            </div>
          );
        })}
      </div>

      {/* Song Preview Card */}
      <div className="min-h-[52px] rounded-xl bg-slate-900/70 border border-slate-800/80 px-3.5 py-2 flex items-center justify-between gap-3">
        {loading ? (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Searching songbook...
          </div>
        ) : matchedSong ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs text-white truncate">{matchedSong.title}</h4>
                <p className="text-[11px] text-slate-400 truncate">{matchedSong.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {matchedSong.language}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        ) : digits.length === 5 ? (
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Code {digits} not found in catalog</span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500 text-center w-full">
            Type 5 digits to resolve track (e.g. 01001)
          </span>
        )}
      </div>
    </div>
  );
}

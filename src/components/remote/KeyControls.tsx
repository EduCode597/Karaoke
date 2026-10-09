import { SlidersHorizontal, RotateCcw, ArrowDown, ArrowUp } from 'lucide-react';

interface KeyControlsProps {
  currentKey: number; // between -6 and +6
  onChangeKey: (newKey: number) => void;
  disabled?: boolean;
}

export default function KeyControls({
  currentKey,
  onChangeKey,
  disabled = false,
}: KeyControlsProps) {
  const handleTranspose = (delta: number) => {
    const next = Math.max(-6, Math.min(6, currentKey + delta));
    onChangeKey(next);
  };

  const handleReset = () => {
    onChangeKey(0);
  };

  const getVocalLabel = (key: number) => {
    if (key === 0) return 'Standard Key (Original)';
    if (key < 0) return `${Math.abs(key)} Semitones Lower (Low/Comfortable Vocal Range)`;
    return `${key} Semitones Higher (High/Bright Vocal Range)`;
  };

  // Semitone steps from -6 to +6
  const semitones = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border border-slate-800/80 shadow-2xl flex flex-col gap-3.5 backdrop-blur-md">
      {/* Header with Title and Current Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Key Transpose (Pitch Shift)
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Wireless real-time pitch adjustment
            </p>
          </div>
        </div>

        {/* LED Key Offset Badge */}
        <div
          className={`px-3 py-1 rounded-xl font-digital text-xs sm:text-sm font-bold tracking-wider ${
            currentKey === 0
              ? 'bg-slate-900 text-slate-400 border border-slate-700'
              : currentKey > 0
                ? 'bg-cyan-950 border border-cyan-400/80 text-cyan-300 shadow-neon-cyan'
                : 'bg-fuchsia-950 border border-fuchsia-400/80 text-fuchsia-300 shadow-neon-magenta'
          }`}
        >
          {currentKey > 0 ? `+${currentKey} ♯` : currentKey < 0 ? `${currentKey} ♭` : 'ORIGINAL'}
        </div>
      </div>

      {/* Visual Semitone Stepper Bar */}
      <div className="flex items-center justify-between gap-1 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
        {semitones.map((st) => {
          const isSelected = st === currentKey;
          const isCenter = st === 0;

          return (
            <button
              key={st}
              onClick={() => onChangeKey(st)}
              disabled={disabled}
              className={`flex-1 h-6 rounded-md flex items-center justify-center font-digital text-[10px] font-bold transition-all ${
                isSelected
                  ? st > 0
                    ? 'bg-cyan-400 text-black shadow-neon-cyan scale-110 z-10'
                    : st < 0
                      ? 'bg-fuchsia-400 text-black shadow-neon-magenta scale-110 z-10'
                      : 'bg-amber-400 text-black shadow-neon-amber scale-110 z-10'
                  : isCenter
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-950 text-slate-600 hover:text-slate-300'
              }`}
              title={`Jump to ${st > 0 ? `+${st}` : st}`}
            >
              {st === 0 ? '0' : st > 0 ? `+${st}` : st}
            </button>
          );
        })}
      </div>

      {/* Tactile Transpose Action Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* Flat (Down) */}
        <button
          onClick={() => handleTranspose(-1)}
          disabled={disabled || currentKey <= -6}
          className="py-3 px-2 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-fuchsia-500/50 text-slate-200 font-digital text-base sm:text-lg font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md group touch-manipulation min-h-[44px]"
          title="Transpose down 1 semitone"
        >
          <ArrowDown className="w-3.5 h-3.5 text-fuchsia-400" />
          <span className="text-fuchsia-400 text-xl leading-none">♭</span>
          <span className="text-xs font-mono text-slate-300">LOWER</span>
        </button>

        {/* Reset (Original) */}
        <button
          onClick={handleReset}
          disabled={disabled || currentKey === 0}
          className="py-3 px-2 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-400/50 text-slate-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md touch-manipulation min-h-[44px]"
          title="Reset to original track key"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>ORIGINAL</span>
        </button>

        {/* Sharp (Up) */}
        <button
          onClick={() => handleTranspose(1)}
          disabled={disabled || currentKey >= 6}
          className="py-3 px-2 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-400/50 text-slate-200 font-digital text-base sm:text-lg font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md group touch-manipulation min-h-[44px]"
          title="Transpose up 1 semitone"
        >
          <span className="text-cyan-400 text-xl leading-none">♯</span>
          <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono text-slate-300">RAISE</span>
        </button>
      </div>

      {/* Vocal Range Hint */}
      <p className="text-[11px] text-slate-400 font-mono text-center">
        {getVocalLabel(currentKey)}
      </p>
    </div>
  );
}

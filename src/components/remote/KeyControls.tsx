import { SlidersHorizontal, RotateCcw } from 'lucide-react';

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

  // Vocal range recommendation label
  const getVocalLabel = (key: number) => {
    if (key === 0) return 'Standard Key (Original)';
    if (key < 0) return `${Math.abs(key)} Semitones Lower (Deep/Low Vocal Range)`;
    return `${key} Semitones Higher (High/Bright Vocal Range)`;
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-3">
      {/* Header with Title and Current Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Key Transpose (Pitch Shift)
          </h4>
        </div>

        {/* LED Key Offset Badge */}
        <div
          className={`px-2.5 py-1 rounded-lg font-digital text-xs font-bold tracking-wider ${
            currentKey === 0
              ? 'bg-slate-800 text-slate-400 border border-slate-700'
              : currentKey > 0
                ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-400 shadow-neon-cyan/40'
                : 'bg-fuchsia-950 border border-fuchsia-500/50 text-fuchsia-400 shadow-neon-magenta/40'
          }`}
        >
          KEY: {currentKey > 0 ? `+${currentKey}` : currentKey}
        </div>
      </div>

      {/* Tactile Transpose Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Flat (Down) */}
        <button
          onClick={() => handleTranspose(-1)}
          disabled={disabled || currentKey <= -6}
          className="py-3 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-fuchsia-500/50 text-slate-200 font-digital text-lg font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md group"
          title="Transpose down 1 semitone"
        >
          <span className="text-fuchsia-400 group-hover:scale-125 transition-transform text-xl">
            ♭
          </span>
          <span className="text-xs font-mono text-slate-400">FLAT (-1)</span>
        </button>

        {/* Reset (Original) */}
        <button
          onClick={handleReset}
          disabled={disabled || currentKey === 0}
          className="py-3 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 text-slate-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md"
          title="Reset to original track key"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>ORIGINAL</span>
        </button>

        {/* Sharp (Up) */}
        <button
          onClick={() => handleTranspose(1)}
          disabled={disabled || currentKey >= 6}
          className="py-3 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400/50 text-slate-200 font-digital text-lg font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md group"
          title="Transpose up 1 semitone"
        >
          <span className="text-cyan-400 group-hover:scale-125 transition-transform text-xl">
            ♯
          </span>
          <span className="text-xs font-mono text-slate-400">SHARP (+1)</span>
        </button>
      </div>

      {/* Vocal Range Hint */}
      <p className="text-[11px] text-slate-400 font-mono text-center">
        {getVocalLabel(currentKey)}
      </p>
    </div>
  );
}

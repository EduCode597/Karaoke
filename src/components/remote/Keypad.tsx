import { Delete } from 'lucide-react';

interface KeypadProps {
  onDigitPress: (digit: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEnter: () => void;
  canEnter: boolean;
}

export default function Keypad({
  onDigitPress,
  onClear,
  onBackspace,
  onEnter,
  canEnter,
}: KeypadProps) {
  // Web Audio click generator for physical tactile feel
  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  const handleKeyPress = (digit: string) => {
    playClickSound();
    onDigitPress(digit);
  };

  const handleAction = (actionFn: () => void) => {
    playClickSound();
    actionFn();
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 3x4 Keypad Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Row 1: 1, 2, 3 */}
        {['1', '2', '3'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            className="h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 active:border-amber-400 active:scale-95 transition-all text-2xl font-digital font-bold text-white shadow-md flex items-center justify-center touch-manipulation select-none"
          >
            {digit}
          </button>
        ))}

        {/* Row 2: 4, 5, 6 */}
        {['4', '5', '6'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            className="h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 active:border-amber-400 active:scale-95 transition-all text-2xl font-digital font-bold text-white shadow-md flex items-center justify-center touch-manipulation select-none"
          >
            {digit}
          </button>
        ))}

        {/* Row 3: 7, 8, 9 */}
        {['7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            className="h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 active:border-amber-400 active:scale-95 transition-all text-2xl font-digital font-bold text-white shadow-md flex items-center justify-center touch-manipulation select-none"
          >
            {digit}
          </button>
        ))}

        {/* Row 4: CLEAR, 0, ENTER */}
        <button
          onClick={() => handleAction(onClear)}
          className="h-16 rounded-2xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 active:scale-95 transition-all text-sm font-mono font-bold text-rose-400 flex items-center justify-center uppercase tracking-wider touch-manipulation select-none shadow-sm"
        >
          Clear
        </button>

        <button
          onClick={() => handleKeyPress('0')}
          className="h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 active:border-amber-400 active:scale-95 transition-all text-2xl font-digital font-bold text-white shadow-md flex items-center justify-center touch-manipulation select-none"
        >
          0
        </button>

        <button
          onClick={() => handleAction(onEnter)}
          disabled={!canEnter}
          className={`h-16 rounded-2xl border font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center active:scale-95 transition-all touch-manipulation select-none ${
            canEnter
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black border-cyan-400 shadow-neon-cyan animate-pulse'
              : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          Enter
        </button>
      </div>

      {/* Auxiliary Backspace Row */}
      <div className="flex justify-end">
        <button
          onClick={() => handleAction(onBackspace)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono active:scale-95 transition-all touch-manipulation"
        >
          <Delete className="w-3.5 h-3.5" />
          <span>Backspace</span>
        </button>
      </div>
    </div>
  );
}

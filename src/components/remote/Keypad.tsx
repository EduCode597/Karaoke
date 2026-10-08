import { Delete, RotateCcw, CornerDownLeft } from 'lucide-react';
import { playKeypadClick } from '../../utils/soundEffects';

interface KeypadProps {
  onDigitPress: (digit: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEnter: () => void;
  canEnter: boolean;
}

const KEYPAD_KEYS = [
  { digit: '1', letters: ' ' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
];

export default function Keypad({
  onDigitPress,
  onClear,
  onBackspace,
  onEnter,
  canEnter,
}: KeypadProps) {
  const handleKeyPress = (digit: string) => {
    playKeypadClick();
    onDigitPress(digit);
  };

  const handleAction = (actionFn: () => void) => {
    playKeypadClick();
    actionFn();
  };

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* 3x4 Tactile Keypad Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-2xl backdrop-blur-md">
        {/* Keys 1 through 9 */}
        {KEYPAD_KEYS.map(({ digit, letters }) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 active:border-amber-400 active:translate-y-0.5 active:scale-[0.97] transition-all flex flex-col items-center justify-center touch-manipulation shadow-md group relative overflow-hidden"
          >
            {/* Subtle top edge highlight */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-white/10 group-hover:bg-white/20" />
            <span className="text-2xl sm:text-3xl font-digital font-bold text-white group-hover:text-amber-300 transition-colors leading-none">
              {digit}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 tracking-widest mt-1">
              {letters}
            </span>
          </button>
        ))}

        {/* Row 4: CLEAR, 0, ENTER */}
        {/* Clear Button */}
        <button
          onClick={() => handleAction(onClear)}
          className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-950 border border-rose-500/30 hover:border-rose-500/60 active:translate-y-0.5 active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-1 text-rose-300 font-mono font-bold text-xs uppercase tracking-wider touch-manipulation shadow-md"
          title="Clear entered digits"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Clear</span>
        </button>

        {/* 0 Key */}
        <button
          onClick={() => handleKeyPress('0')}
          className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 active:border-amber-400 active:translate-y-0.5 active:scale-[0.97] transition-all flex flex-col items-center justify-center touch-manipulation shadow-md group relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/10 group-hover:bg-white/20" />
          <span className="text-2xl sm:text-3xl font-digital font-bold text-white group-hover:text-amber-300 transition-colors leading-none">
            0
          </span>
          <span className="text-[10px] font-mono text-slate-500 tracking-widest mt-1">OPER</span>
        </button>

        {/* Enter / Reserve Button */}
        <button
          onClick={() => handleAction(onEnter)}
          disabled={!canEnter}
          className={`h-16 sm:h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 font-mono font-black text-xs sm:text-sm uppercase tracking-wider active:translate-y-0.5 active:scale-[0.97] transition-all touch-manipulation shadow-lg ${
            canEnter
              ? 'bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 text-slate-950 border-cyan-300 shadow-neon-cyan animate-pulse cursor-pointer'
              : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
          }`}
          title="Enter 5-digit code to reserve song"
        >
          <CornerDownLeft
            className={`w-4 h-4 ${canEnter ? 'text-slate-950 stroke-[3]' : 'text-slate-600'}`}
          />
          <span>Enter</span>
        </button>
      </div>

      {/* Auxiliary Tactile Backspace Row */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[11px] font-mono text-slate-500">
          Tip: Tap <strong>5 digits</strong> to preview and queue.
        </span>
        <button
          onClick={() => handleAction(onBackspace)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-mono active:scale-95 transition-all touch-manipulation min-h-[40px]"
          title="Delete last digit"
        >
          <Delete className="w-4 h-4" />
          <span>Backspace</span>
        </button>
      </div>
    </div>
  );
}

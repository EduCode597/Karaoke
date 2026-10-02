import { useState, useRef, useEffect } from 'react';
import { Volume2, ShieldAlert } from 'lucide-react';

interface SoundboardProps {
  onTriggerSfx: (sfxType: string, label: string) => void;
  disabled?: boolean;
}

interface SfxItem {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  colorScheme: 'amber' | 'cyan' | 'fuchsia' | 'rose';
}

const SFX_LIST: SfxItem[] = [
  {
    id: 'airhorn',
    name: 'AIRHORN BLAST',
    subtitle: 'Classic Reggae Siren',
    emoji: '📢',
    colorScheme: 'amber',
  },
  {
    id: 'applause',
    name: 'CROWD CHEER',
    subtitle: 'Clapping & Ovation',
    emoji: '👏',
    colorScheme: 'cyan',
  },
  {
    id: 'drumroll',
    name: 'DRUMROLL',
    subtitle: 'Dramatic Snare Roll & Crash',
    emoji: '🥁',
    colorScheme: 'fuchsia',
  },
  {
    id: 'gong',
    name: 'FAIL GONG',
    subtitle: 'Tawag ng Tanghalan Gong',
    emoji: '🔔',
    colorScheme: 'rose',
  },
];

export default function Soundboard({ onTriggerSfx, disabled = false }: SoundboardProps) {
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<number | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);

  const COOLDOWN_MS = 800;

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const handlePress = (sfx: SfxItem) => {
    const now = Date.now();
    if (now - lastTriggerTimeRef.current < COOLDOWN_MS) return;

    lastTriggerTimeRef.current = now;
    setCooldownRemaining(COOLDOWN_MS);

    // Countdown interval for cooldown progress
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    const interval = 50;
    cooldownTimerRef.current = window.setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= interval) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    // Trigger vibration if available
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }

    onTriggerSfx(sfx.id, sfx.name);
  };

  const isCoolingDown = cooldownRemaining > 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Soundboard Header & Cooldown Status */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-400 shadow-neon-magenta">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wide text-white uppercase font-mono">
              Party Soundboard
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Tap to blast live SFX through TV speakers
            </p>
          </div>
        </div>

        {/* Cooldown Pill */}
        <div
          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${
            isCoolingDown
              ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 animate-pulse'
              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
          }`}
        >
          {isCoolingDown ? `Cooling down...` : 'Ready to Blast'}
        </div>
      </div>

      {/* Grid of 4 SFX Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {SFX_LIST.map((sfx) => {
          const isPressed = isCoolingDown;

          return (
            <button
              key={sfx.id}
              onClick={() => handlePress(sfx)}
              disabled={disabled || isPressed}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 active:scale-95 transition-all shadow-lg select-none relative overflow-hidden group ${
                sfx.colorScheme === 'amber'
                  ? 'bg-slate-950 border-amber-500/40 hover:border-amber-400 shadow-neon-amber/20'
                  : sfx.colorScheme === 'cyan'
                    ? 'bg-slate-950 border-cyan-500/40 hover:border-cyan-400 shadow-neon-cyan/20'
                    : sfx.colorScheme === 'fuchsia'
                      ? 'bg-slate-950 border-fuchsia-500/40 hover:border-fuchsia-400 shadow-neon-magenta/20'
                      : 'bg-slate-950 border-rose-500/40 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {/* Top Row: Emoji Icon & Badge */}
              <div className="flex items-center justify-between">
                <span className="text-3xl group-hover:scale-125 transition-transform duration-200">
                  {sfx.emoji}
                </span>

                <span
                  className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    sfx.colorScheme === 'amber'
                      ? 'bg-amber-400/20 text-amber-300'
                      : sfx.colorScheme === 'cyan'
                        ? 'bg-cyan-400/20 text-cyan-300'
                        : sfx.colorScheme === 'fuchsia'
                          ? 'bg-fuchsia-400/20 text-fuchsia-300'
                          : 'bg-rose-400/20 text-rose-300'
                  }`}
                >
                  LIVE SFX
                </span>
              </div>

              {/* Bottom: Title & Subtitle */}
              <div>
                <h4 className="font-black text-sm text-white tracking-wider font-mono">
                  {sfx.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sfx.subtitle}</p>
              </div>

              {/* Ambient Hover Gradient Glow */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${
                  sfx.colorScheme === 'amber'
                    ? 'bg-amber-400'
                    : sfx.colorScheme === 'cyan'
                      ? 'bg-cyan-400'
                      : sfx.colorScheme === 'fuchsia'
                        ? 'bg-fuchsia-400'
                        : 'bg-rose-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Safety Notice against Audio Spam */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-500 text-[10px] font-mono flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Audio spam protection active (800ms cooldown per sound effect).</span>
      </div>
    </div>
  );
}

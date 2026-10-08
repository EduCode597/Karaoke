import { useState, useRef, useEffect } from 'react';
import { Volume2, ShieldAlert, Radio } from 'lucide-react';

interface SoundboardProps {
  onTriggerSfx: (sfxType: string, label: string) => void;
  disabled?: boolean;
}

interface SfxItem {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  badge: string;
  colorScheme: 'amber' | 'cyan' | 'fuchsia' | 'rose';
}

const SFX_LIST: SfxItem[] = [
  {
    id: 'airhorn',
    name: 'AIRHORN BLAST',
    subtitle: 'Classic Reggae Siren',
    emoji: '📢',
    badge: 'PARTY HYPE',
    colorScheme: 'amber',
  },
  {
    id: 'applause',
    name: 'CROWD CHEER',
    subtitle: 'Standing Ovation & Clapping',
    emoji: '👏',
    badge: 'CHEER',
    colorScheme: 'cyan',
  },
  {
    id: 'drumroll',
    name: 'DRUMROLL',
    subtitle: 'Dramatic Snare Suspense',
    emoji: '🥁',
    badge: 'TENSION',
    colorScheme: 'fuchsia',
  },
  {
    id: 'gong',
    name: 'FAIL GONG',
    subtitle: 'Tawag ng Tanghalan Gong',
    emoji: '🔔',
    badge: 'BUZZER',
    colorScheme: 'rose',
  },
];

export default function Soundboard({ onTriggerSfx, disabled = false }: SoundboardProps) {
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);
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
    setActiveButtonId(sfx.id);

    // Vibration feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 30, 20]);
    }

    onTriggerSfx(sfx.id, sfx.name);

    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    const interval = 40;
    cooldownTimerRef.current = window.setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= interval) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          setActiveButtonId(null);
          return 0;
        }
        return prev - interval;
      });
    }, interval);
  };

  const isCoolingDown = cooldownRemaining > 0;
  const cooldownProgress = isCoolingDown ? (cooldownRemaining / COOLDOWN_MS) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 w-full select-none pb-20">
      {/* Soundboard Header & Cooldown Status */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-500/50 text-fuchsia-400 shadow-neon-magenta">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-wider text-white uppercase font-mono">
                Party Soundboard
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">
                TV Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Blast live effects through the main TV speakers
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div
          className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
            isCoolingDown
              ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 animate-pulse'
              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>{isCoolingDown ? `${Math.ceil(cooldownRemaining / 100) / 10}s` : 'Ready'}</span>
        </div>
      </div>

      {/* Grid of 4 High-Impact Arcade SFX Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {SFX_LIST.map((sfx) => {
          const isThisActive = activeButtonId === sfx.id;

          return (
            <button
              key={sfx.id}
              onClick={() => handlePress(sfx)}
              disabled={disabled || isCoolingDown}
              className={`p-4 sm:p-5 rounded-3xl border text-left flex flex-col justify-between gap-3 active:scale-95 transition-all shadow-xl select-none relative overflow-hidden group min-h-[140px] touch-manipulation ${
                sfx.colorScheme === 'amber'
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/40 hover:border-amber-400 shadow-neon-amber/20'
                  : sfx.colorScheme === 'cyan'
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-500/40 hover:border-cyan-400 shadow-neon-cyan/20'
                    : sfx.colorScheme === 'fuchsia'
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-fuchsia-500/40 hover:border-fuchsia-400 shadow-neon-magenta/20'
                      : 'bg-gradient-to-b from-slate-900 to-slate-950 border-rose-500/40 hover:border-rose-400 shadow-neon-rose/20'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {/* Cooldown progress bar at bottom of card */}
              {isCoolingDown && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-75"
                  style={{ width: `${cooldownProgress}%` }}
                />
              )}

              {/* Top Row: Emoji Icon & Badge */}
              <div className="flex items-center justify-between relative z-10">
                <span
                  className={`text-3xl sm:text-4xl transition-transform duration-200 ${
                    isThisActive ? 'scale-125' : 'group-hover:scale-110'
                  }`}
                >
                  {sfx.emoji}
                </span>

                <span
                  className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    sfx.colorScheme === 'amber'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : sfx.colorScheme === 'cyan'
                        ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                        : sfx.colorScheme === 'fuchsia'
                          ? 'bg-fuchsia-400/20 text-fuchsia-300 border border-fuchsia-400/30'
                          : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                  }`}
                >
                  {sfx.badge}
                </span>
              </div>

              {/* Bottom: Title & Subtitle */}
              <div className="relative z-10">
                <h4 className="font-black text-sm sm:text-base text-white tracking-wide font-mono leading-tight">
                  {sfx.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{sfx.subtitle}</p>
              </div>

              {/* Active Shockwave Flash */}
              {isThisActive && (
                <div className="absolute inset-0 bg-white/20 animate-ping pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Safety Notice against Audio Spam */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 text-[11px] font-mono flex items-center gap-2.5 shadow-md">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Anti-spam governor active (800ms cooldown between audio bursts).</span>
      </div>
    </div>
  );
}

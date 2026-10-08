import { Mic, MicOff, Activity, Radio } from 'lucide-react';
import type { DetectedPitch } from '../../hooks/useMicrophonePitch';

interface PitchMonitorProps {
  isListening: boolean;
  currentPitch: DetectedPitch | null;
  rmsVolume: number;
  onToggleMic: () => void;
  micPermission: 'prompt' | 'granted' | 'denied';
}

export default function PitchMonitor({
  isListening,
  currentPitch,
  rmsVolume,
  onToggleMic,
  micPermission,
}: PitchMonitorProps) {
  // Volume bar segments (12 LED steps)
  const segments = [0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 0.96];

  return (
    <div className="py-3 px-4 sm:px-6 rounded-3xl bg-slate-950/95 border border-slate-800/90 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-xl relative overflow-hidden">
      {/* Subtle top edge specular highlight */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/10 pointer-events-none" />

      {/* Mic Status & Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMic}
          className={`py-2.5 px-4 sm:px-5 rounded-2xl border text-xs sm:text-sm font-mono font-bold flex items-center gap-2 active:scale-95 transition-all touch-manipulation min-h-[44px] ${
            isListening
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400 shadow-neon-emerald'
              : micPermission === 'denied'
                ? 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-amber-500/50 text-amber-300 hover:border-amber-400 hover:text-white shadow-neon-amber/20'
          }`}
          title={isListening ? 'Mute Microphone' : 'Enable Microphone'}
        >
          {isListening ? (
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
          ) : (
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          )}
          <span>
            {isListening
              ? 'Mic Live'
              : micPermission === 'denied'
                ? 'Mic Blocked'
                : 'Enable Vocal Mic'}
          </span>
        </button>

        {!isListening && (
          <span className="text-[11px] sm:text-xs font-mono text-slate-400 hidden sm:inline">
            (Tracks singing accuracy for score)
          </span>
        )}

        {/* Live Pitch Readout */}
        {isListening && (
          <div className="flex items-center gap-2 font-mono">
            {currentPitch ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="px-3.5 py-1 rounded-xl bg-cyan-950 border border-cyan-400/80 text-cyan-300 font-digital font-black text-sm sm:text-base shadow-neon-cyan">
                  {currentPitch.noteName}
                </span>
                <span className="text-xs sm:text-sm text-slate-300 font-digital">
                  {currentPitch.pitchHz} Hz
                </span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 font-mono">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Listening for vocals...</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* LED VU Level Meter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 font-bold hidden md:flex">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>VU Meter</span>
        </div>
        <div className="flex items-center gap-1 p-1.5 sm:p-2 rounded-2xl bg-black border border-slate-800 shadow-inner">
          {segments.map((threshold, idx) => {
            const isActive = isListening && rmsVolume >= threshold;
            const isHigh = idx >= 9;
            const isMid = idx >= 6 && idx < 9;

            return (
              <div
                key={idx}
                className={`w-1.5 sm:w-2 h-5 sm:h-6 rounded-xs transition-all duration-75 ${
                  isActive
                    ? isHigh
                      ? 'bg-rose-500 shadow-neon-rose scale-y-110'
                      : isMid
                        ? 'bg-amber-400 shadow-neon-amber'
                        : 'bg-emerald-400 shadow-neon-emerald'
                    : 'bg-slate-900/80'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

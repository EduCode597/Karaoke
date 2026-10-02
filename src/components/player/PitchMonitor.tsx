import { Mic, MicOff, Activity } from 'lucide-react';
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
  // Volume bar segments (10 LED steps)
  const segments = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  return (
    <div className="py-2.5 sm:py-3 px-4 sm:px-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-4 shadow-lg backdrop-blur-md">
      {/* Mic Status & Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMic}
          className={`py-2 px-3.5 sm:px-4 rounded-xl border text-xs sm:text-sm font-mono font-bold flex items-center gap-2 active:scale-95 transition-all touch-manipulation min-h-[44px] ${
            isListening
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_#10b981]'
              : micPermission === 'denied'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-slate-900 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:text-white shadow-[0_0_10px_rgba(251,191,36,0.15)]'
          }`}
          title={isListening ? 'Mute Microphone' : 'Enable Microphone'}
        >
          {isListening ? (
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
          ) : (
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          )}
          <span>
            {isListening ? 'Mic Active' : micPermission === 'denied' ? 'Mic Blocked' : 'Enable Mic'}
          </span>
        </button>

        {!isListening && (
          <span className="text-[11px] sm:text-xs font-mono text-slate-500 hidden sm:inline">
            (Click to enable live vocal scoring)
          </span>
        )}

        {/* Live Pitch Readout */}
        {isListening && (
          <div className="flex items-center gap-2 font-mono">
            {currentPitch ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="px-3 py-1 rounded-xl bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-bold text-xs sm:text-sm shadow-neon-cyan">
                  {currentPitch.noteName}
                </span>
                <span className="text-xs sm:text-sm text-slate-400">{currentPitch.pitchHz} Hz</span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-600 animate-pulse" />
                <span>Listening for vocals...</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* LED VU Level Meter */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 font-bold hidden sm:inline">
          Input Level
        </span>
        <div className="flex items-center gap-1 p-1 sm:p-1.5 rounded-xl bg-slate-900 border border-slate-800">
          {segments.map((threshold, idx) => {
            const isActive = isListening && rmsVolume >= threshold;
            const isHigh = idx >= 8;
            const isMid = idx >= 5 && idx < 8;

            return (
              <div
                key={idx}
                className={`w-1.5 sm:w-2 h-4 sm:h-5 rounded-xs transition-all ${
                  isActive
                    ? isHigh
                      ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                      : isMid
                        ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                        : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

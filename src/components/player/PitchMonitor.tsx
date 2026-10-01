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
    <div className="py-2.5 px-4 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3 shadow-md">
      {/* Mic Status & Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleMic}
          className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 active:scale-95 transition-all ${
            isListening
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_#10b981]'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title={isListening ? 'Mute Microphone' : 'Enable Microphone'}
        >
          {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {isListening ? 'Mic Active' : micPermission === 'denied' ? 'Mic Blocked' : 'Enable Mic'}
          </span>
        </button>

        {/* Live Pitch Readout */}
        {isListening && (
          <div className="flex items-center gap-2 font-mono">
            {currentPitch ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-bold text-xs shadow-neon-cyan">
                  {currentPitch.noteName}
                </span>
                <span className="text-[11px] text-slate-400">{currentPitch.pitchHz} Hz</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Activity className="w-3 h-3 text-slate-600" />
                <span>Listening for vocals...</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* LED VU Level Meter */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-500 hidden md:inline">
          Input Level
        </span>
        <div className="flex items-center gap-0.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
          {segments.map((threshold, idx) => {
            const isActive = isListening && rmsVolume >= threshold;
            const isHigh = idx >= 8;
            const isMid = idx >= 5 && idx < 8;

            return (
              <div
                key={idx}
                className={`w-1.5 h-3.5 rounded-xs transition-all ${
                  isActive
                    ? isHigh
                      ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                      : isMid
                        ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                        : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
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

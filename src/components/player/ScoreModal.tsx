import { useEffect, useState, useRef } from 'react';
import { Award, Music, Sparkles, X, ArrowRight, User } from 'lucide-react';
import type { VideokeScoreResult } from '../../utils/scoring';
import { playScoreTick, playScoreFanfare } from '../../utils/sfx';

interface ScoreModalProps {
  isOpen: boolean;
  result: VideokeScoreResult | null;
  singerName?: string;
  songTitle?: string;
  onClose: () => void;
  autoDismissSeconds?: number;
}

export default function ScoreModal({
  isOpen,
  result,
  singerName = 'Guest Singer',
  songTitle = 'Song',
  onClose,
  autoDismissSeconds = 8,
}: ScoreModalProps) {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [countdown, setCountdown] = useState(autoDismissSeconds);
  const fanfarePlayedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !result) {
      setDisplayedScore(0);
      setIsRolling(false);
      setCountdown(autoDismissSeconds);
      fanfarePlayedRef.current = false;
      return;
    }

    setIsRolling(true);
    fanfarePlayedRef.current = false;
    const targetScore = result.score;
    const duration = 2400; // 2.4 seconds rolling
    const startTime = performance.now();

    const rollInterval = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easedProgress * targetScore);
      setDisplayedScore(currentVal);

      // Play tick sound periodically
      if (Math.random() > 0.4) {
        playScoreTick();
      }

      if (progress < 1) {
        requestAnimationFrame(rollInterval);
      } else {
        setDisplayedScore(targetScore);
        setIsRolling(false);
        if (!fanfarePlayedRef.current) {
          fanfarePlayedRef.current = true;
          playScoreFanfare(result.tier);
        }
      }
    };

    const animId = requestAnimationFrame(rollInterval);

    // Auto-dismiss countdown timer
    const timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(timerInterval);
    };
  }, [isOpen, result, autoDismissSeconds, onClose]);

  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in crt-overlay">
      {/* Ambient Pulsing Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-950/40 via-cyan-950/30 to-black pointer-events-none" />

      {/* Main Score Card Container */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-950/95 border-2 border-amber-400/60 shadow-[0_0_50px_rgba(251,191,36,0.3)] p-6 md:p-8 flex flex-col items-center text-center gap-5 z-10">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Dismiss Score"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest shadow-neon-amber">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>PinoyVideoke Official Score</span>
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
        </div>

        {/* Singer & Song Subtitle */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
            <User className="w-3.5 h-3.5" />
            <span>{singerName}</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            <Music className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="truncate max-w-[200px]">{songTitle}</span>
          </span>
        </div>

        {/* Massive 7-Segment Rolling Digital Score */}
        <div className="py-4 flex flex-col items-center">
          <div className="text-7xl md:text-9xl font-digital font-black tracking-widest text-amber-300 text-glow-amber select-none">
            {displayedScore < 10 ? `0${displayedScore}` : displayedScore}
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500/80 -mt-2">
            Points out of 100
          </span>
        </div>

        {/* Commentary Box */}
        <div
          className={`w-full p-4 rounded-2xl border transition-all ${
            result.tier === 'champion' || result.tier === 'concert'
              ? 'bg-gradient-to-r from-amber-950/40 via-fuchsia-950/40 to-slate-900 border-amber-400/60 shadow-neon-amber'
              : result.tier === 'practice'
                ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-sm md:text-base font-black tracking-wide text-white uppercase drop-shadow">
              {result.commentary}
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-mono">{result.subtext}</p>
        </div>

        {/* Singing Performance Stats Breakdown */}
        <div className="grid grid-cols-2 gap-3 w-full text-left">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Vocal Activity:</span>
            <span className="text-base font-digital font-bold text-cyan-400">
              {Math.round(result.stats.singingRatio * 100)}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Pitch Stability:</span>
            <span className="text-base font-digital font-bold text-fuchsia-400">
              {Math.round(result.stats.pitchStability * 100)}%
            </span>
          </div>
        </div>

        {/* Bottom Action & Countdown Bar */}
        <div className="flex items-center justify-between w-full pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
          <span>Auto-advancing in {countdown}s...</span>
          <button
            onClick={onClose}
            disabled={isRolling}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 active:scale-95 text-black font-black uppercase tracking-wider flex items-center gap-2 shadow-neon-cyan transition-all"
          >
            <span>Next Song</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

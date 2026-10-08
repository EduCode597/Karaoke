import { useEffect, useState, useRef } from 'react';
import { Award, Music, Sparkles, X, ArrowRight, User, MicOff, Flame, Trophy } from 'lucide-react';
import type { VideokeScoreResult } from '../../utils/scoring';
import { playScoreTick, playScoreFanfare } from '../../utils/soundEffects';

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

  // Keyboard accessibility: Dismiss modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const isHighScorer = result.score >= 85;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-modal-title"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in crt-overlay"
    >
      {/* Ambient Pulsing Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-fuchsia-950/20 to-black pointer-events-none" />

      {/* Main Score Card Container (Double-Bezel) */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-950/95 border-2 border-amber-400/70 shadow-[0_0_80px_rgba(251,191,36,0.35)] p-6 md:p-8 flex flex-col items-center text-center gap-5 z-10 overflow-hidden">
        {/* Subtle scanline grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center z-20"
          title="Dismiss Score"
          aria-label="Dismiss score modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div
          id="score-modal-title"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest shadow-neon-amber relative z-10"
        >
          {isHighScorer ? (
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          )}
          <span>PinoyVideoke Official Score</span>
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
        </div>

        {/* Singer & Song Subtitle */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono text-slate-300 relative z-10">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
            <User className="w-3.5 h-3.5" />
            <span className="font-bold">{singerName}</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <Music className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="truncate max-w-[220px]">{songTitle}</span>
          </span>
        </div>

        {/* Massive 7-Segment Rolling Digital Score */}
        <div className="py-2 flex flex-col items-center relative z-10">
          <div className="text-8xl md:text-9xl font-digital font-black tracking-widest text-amber-300 text-glow-amber select-none leading-none">
            {displayedScore < 10 ? `0${displayedScore}` : displayedScore}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400/90 mt-2 font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Points out of 100</span>
          </div>
        </div>

        {/* Commentary Box */}
        <div
          className={`w-full p-4 md:p-5 rounded-2xl border transition-all relative z-10 ${
            result.tier === 'champion' || result.tier === 'concert'
              ? 'bg-gradient-to-r from-amber-950/60 via-fuchsia-950/50 to-slate-900 border-amber-400/80 shadow-neon-amber'
              : result.tier === 'practice'
                ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-300 shadow-neon-cyan/20'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-neon-rose/20'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-base md:text-lg font-black tracking-wide text-white uppercase drop-shadow">
              {result.commentary}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-200 font-mono leading-relaxed">
            {result.subtext}
          </p>
        </div>

        {/* Singing Performance Stats Breakdown */}
        <div className="grid grid-cols-2 gap-3 w-full text-left relative z-10">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Vocal Activity:
              </span>
              <span className="text-base font-digital font-bold text-cyan-400">
                {Math.round(result.stats.singingRatio * 100)}%
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-cyan-400 shadow-neon-cyan rounded-full transition-all duration-1000"
                style={{ width: `${Math.round(result.stats.singingRatio * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Pitch Stability:
              </span>
              <span className="text-base font-digital font-bold text-fuchsia-400">
                {Math.round(result.stats.pitchStability * 100)}%
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-fuchsia-400 shadow-neon-magenta rounded-full transition-all duration-1000"
                style={{ width: `${Math.round(result.stats.pitchStability * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mic Standby Notice if 0 vocal samples were captured */}
        {result.stats.activeSamples === 0 && (
          <div className="w-full p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-center gap-2.5 shadow-sm relative z-10">
            <MicOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="text-center">
              <strong>Microphone was on Standby:</strong> Click <strong>"Enable Mic"</strong> on the
              TV screen before singing to track live vocal pitch!
            </span>
          </div>
        )}

        {/* Bottom Action & Countdown Bar */}
        <div className="flex items-center justify-between w-full pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400 relative z-10">
          <span>
            Auto-advancing in <strong className="text-amber-400 font-digital">{countdown}s</strong>
            ...
          </span>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 hover:opacity-95 active:scale-95 text-slate-950 font-black uppercase tracking-wider flex items-center gap-2 shadow-neon-cyan transition-all touch-manipulation min-h-[44px]"
          >
            <span>{isRolling ? 'Skip Animation' : 'Next Song'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

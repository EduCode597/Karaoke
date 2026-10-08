import React, { useState, useEffect } from 'react';
import { Mic2, X, CheckCircle2, Sparkles } from 'lucide-react';
import type { Song } from '../../types/song';

interface ReservationModalProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
  onConfirm: (singerName: string) => Promise<void>;
  loading: boolean;
}

export default function ReservationModal({
  isOpen,
  song,
  onClose,
  onConfirm,
  loading,
}: ReservationModalProps) {
  const [singerName, setSingerName] = useState(() => {
    return localStorage.getItem('pinoyvideoke_singer_name') || '';
  });

  // Keyboard accessibility: dismiss modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !song) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = singerName.trim().replace(/[<>]/g, '').slice(0, 30) || 'Guest';
    localStorage.setItem('pinoyvideoke_singer_name', finalName);
    await onConfirm(finalName);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-5 sm:p-6 flex flex-col gap-5 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-neon-cyan">
            <Mic2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 id="reservation-modal-title" className="font-bold text-base text-white">
                Reserve Song
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 font-mono">Join the party singing queue</p>
          </div>
        </div>

        {/* Selected Song Preview Card (Double-Bezel) */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 shadow-inner relative z-10">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-400/40 text-amber-400 font-digital font-bold text-sm tracking-wider shadow-[0_0_8px_rgba(251,191,36,0.2)] shrink-0">
            {song.code}
          </div>
          <div className="overflow-hidden min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate">{song.title}</h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.artist}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Singer Name:
            </label>
            <input
              type="text"
              value={singerName}
              onChange={(e) => setSingerName(e.target.value)}
              placeholder="e.g. Tito Boy, Ate Sarah, Rockstar..."
              maxLength={30}
              aria-label="Singer Name"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm text-white font-mono placeholder:text-slate-500 transition-all shadow-inner"
              autoFocus
            />
            <p className="text-[10px] text-slate-500 font-mono">
              This name will be announced on the big TV screen!
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-colors touch-manipulation min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-95 active:scale-95 transition-all text-xs font-black uppercase text-slate-950 flex items-center justify-center gap-1.5 shadow-neon-cyan touch-manipulation min-h-[44px]"
            >
              {loading ? (
                <span>Queueing...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reserve Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Mic2, X, CheckCircle2 } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6 flex flex-col gap-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-neon-cyan">
            <Mic2 className="w-6 h-6" />
          </div>
          <div>
            <h3 id="reservation-modal-title" className="font-bold text-base text-white">
              Reserve Song
            </h3>
            <p className="text-xs text-slate-400 font-mono">Join the party queue</p>
          </div>
        </div>

        {/* Selected Song Preview Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 font-digital font-bold text-sm">
            {song.code}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-xs text-white truncate">{song.title}</h4>
            <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Singer Name:</label>
            <input
              type="text"
              value={singerName}
              onChange={(e) => setSingerName(e.target.value)}
              placeholder="e.g. Tito Boy, Ate Sarah..."
              maxLength={30}
              aria-label="Singer Name"
              className="w-full py-3 px-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:outline-none text-sm text-white font-mono placeholder:text-slate-600"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 active:scale-95 transition-all text-xs font-black uppercase text-black flex items-center justify-center gap-1.5 shadow-neon-cyan"
            >
              {loading ? (
                <span>Reserving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reserve</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
